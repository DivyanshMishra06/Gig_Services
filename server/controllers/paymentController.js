const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PaymentEvent = require('../models/PaymentEvent');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { createRazorpayOrder, getRazorpayKeyId, verifyRazorpayWebhook, hashPayload } = require('../services/paymentService');

const isObjectId = value => mongoose.Types.ObjectId.isValid(value);
const idsMatch = (left, right) => String(left) === String(right);

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!isObjectId(bookingId)) return res.status(400).json({ message: 'A valid booking ID is required.' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (!idsMatch(booking.customerId, req.user._id)) return res.status(403).json({ message: 'Not authorized to pay for this booking.' });
    if (booking.status !== 'awaiting_payment') {
      return res.status(409).json({ message: 'This booking is not awaiting payment.' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({ message: 'This booking has already been paid.' });
    }
    if (!Number.isInteger(booking.amount) || booking.amount < 10 || booking.currency !== 'INR') {
      return res.status(422).json({ message: 'This booking does not have a valid payment quote.' });
    }
    const keyId = getRazorpayKeyId();

    // Reuse an outstanding order. This prevents accidental duplicate checkout
    // attempts from creating multiple orders for the same booking.
    const outstanding = await Payment.findOne({
      bookingId: booking._id,
      customerId: req.user._id,
      provider: 'razorpay',
      status: { $in: ['created', 'pending', 'authorized'] },
      providerOrderId: { $exists: true }
    }).sort({ createdAt: -1 });
    if (outstanding) {
      return res.json({
        orderId: outstanding.providerOrderId,
        amount: outstanding.amount,
        currency: outstanding.currency,
        keyId,
        bookingId: booking._id
      });
    }

    const receipt = `AS_${booking.bookingId}_${Date.now().toString(36)}`.slice(0, 40);
    const order = await createRazorpayOrder({
      amount: booking.amount,
      currency: booking.currency,
      receipt,
      bookingId: booking._id
    });
    if (order.amount !== booking.amount || order.currency !== booking.currency) {
      return res.status(502).json({ message: 'Payment provider returned an invalid order quote.' });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: req.user._id,
      provider: 'razorpay',
      providerOrderId: order.id,
      receipt,
      amount: booking.amount,
      currency: booking.currency,
      status: 'created'
    });
    booking.paymentStatus = 'pending';
    booking.latestPaymentId = payment._id;
    await booking.save();

    res.status(201).json({
      orderId: order.id,
      amount: payment.amount,
      currency: payment.currency,
      keyId,
      bookingId: booking._id
    });
  } catch (error) {
    res.status(error.statusCode || 502).json({ message: error.message || 'Unable to create payment order.' });
  }
};

const processCapturedPayment = async ({ paymentEntity, eventId, event }) => {
  const providerOrderId = paymentEntity?.order_id;
  if (!providerOrderId) throw new Error('Webhook payment is missing an order ID.');

  const payment = await Payment.findOne({ provider: 'razorpay', providerOrderId });
  if (!payment) throw new Error('Webhook order is not associated with an ActiveSetu payment.');

  const booking = await Booking.findById(payment.bookingId);
  if (!booking || !idsMatch(payment.customerId, booking.customerId)) {
    throw new Error('Webhook payment does not match its booking customer.');
  }
  if (paymentEntity.amount !== payment.amount || paymentEntity.currency !== payment.currency || payment.amount !== booking.amount) {
    throw new Error('Webhook payment amount or currency does not match the booking quote.');
  }
  if (booking.status !== 'awaiting_payment' && booking.paymentStatus !== 'paid') {
    throw new Error('Webhook payment cannot confirm this booking state.');
  }

  // Mark the Payment as captured (idempotent: skips if already captured).
  await Payment.updateOne(
    { _id: payment._id, status: { $ne: 'captured' } },
    {
      $set: {
        status: 'captured',
        providerPaymentId: paymentEntity.id,
        paymentMethod: paymentEntity.method,
        capturedAt: new Date()
      }
    }
  );

  // Transition the Booking from awaiting_payment → pending and mark paid.
  // The condition ensures this is idempotent: a retry after a successful
  // update simply matches zero documents and does nothing.
  const bookingUpdate = await Booking.updateOne(
    { _id: booking._id, status: 'awaiting_payment' },
    {
      $set: {
        paymentStatus: 'paid',
        latestPaymentId: payment._id,
        status: 'pending'
      },
      $push: {
        timeline: { status: 'pending', timestamp: new Date(), note: 'Payment verified by Razorpay' }
      }
    }
  );

  const transitioned = bookingUpdate.modifiedCount > 0;
  console.log(`[webhook] payment.captured orderId=${providerOrderId} booking=${booking._id} transitioned=${transitioned}`);

  if (!transitioned) return;

  // Notify the worker about the new paid booking.
  const worker = await Worker.findById(booking.workerId).select('userId');
  if (worker) {
    await Notification.create({
      userId: worker.userId,
      title: 'New Paid Booking Request',
      message: `${booking.customerName} has paid for ${booking.serviceName} service`,
      type: 'payment',
      relatedBookingId: booking._id
    });
  }
};

const processFailedPayment = async paymentEntity => {
  const providerOrderId = paymentEntity?.order_id;
  if (!providerOrderId) throw new Error('Webhook payment is missing an order ID.');
  const payment = await Payment.findOne({ provider: 'razorpay', providerOrderId });
  if (!payment) throw new Error('Webhook order is not associated with an ActiveSetu payment.');
  if (paymentEntity.amount !== payment.amount || paymentEntity.currency !== payment.currency) {
    throw new Error('Webhook payment amount or currency does not match the payment record.');
  }
  await Payment.updateOne(
    { _id: payment._id, status: { $ne: 'captured' } },
    {
      $set: {
        status: 'failed',
        providerPaymentId: paymentEntity.id,
        paymentMethod: paymentEntity.method,
        failureCode: paymentEntity.error_code,
        failureDescription: paymentEntity.error_description
      }
    }
  );
  await Booking.updateOne(
    { _id: payment.bookingId, paymentStatus: { $ne: 'paid' } },
    { $set: { paymentStatus: 'failed' } }
  );
};

exports.handleWebhook = async (req, res) => {
  const signature = req.get('x-razorpay-signature');
  const eventId = req.get('x-razorpay-event-id');
  console.log(`[webhook] received event=${eventId || 'none'} sig=${signature ? 'present' : 'missing'} bodyType=${Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body} bodyLen=${req.body?.length || 0}`);
  if (!verifyRazorpayWebhook(req.body, signature)) {
    console.error(`[webhook] signature verification failed – check RAZORPAY_WEBHOOK_SECRET`);
    return res.status(401).json({ message: 'Invalid Razorpay webhook signature.' });
  }
  if (!eventId) return res.status(400).json({ message: 'Missing Razorpay event ID.' });

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ message: 'Invalid webhook payload.' });
  }

  const eventType = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;
  console.log(`[webhook] eventType=${eventType} paymentId=${paymentEntity?.id} orderId=${paymentEntity?.order_id}`);

  let event;
  try {
    event = await PaymentEvent.create({
      provider: 'razorpay',
      eventId,
      eventType: eventType || 'unknown',
      providerPaymentId: paymentEntity?.id,
      payloadHash: hashPayload(req.body),
      status: 'received'
    });
  } catch (error) {
    if (error.code !== 11000) return res.status(500).json({ message: 'Could not record payment event.' });
    event = await PaymentEvent.findOne({ provider: 'razorpay', eventId });
    if (event?.status === 'processed' || event?.status === 'ignored') {
      console.log(`[webhook] duplicate event=${eventId} already ${event.status}`);
      return res.status(200).json({ received: true, duplicate: true });
    }
  }

  try {
    if (eventType === 'payment.captured') {
      await processCapturedPayment({ paymentEntity, eventId, event });
      await PaymentEvent.updateOne({ _id: event?._id }, { $set: { status: 'processed', processedAt: new Date() } });
      console.log(`[webhook] payment.captured processed successfully event=${eventId}`);
    } else if (eventType === 'payment.failed') {
      await processFailedPayment(paymentEntity);
      await PaymentEvent.updateOne({ _id: event?._id }, { $set: { status: 'processed', processedAt: new Date() } });
      console.log(`[webhook] payment.failed processed event=${eventId}`);
    } else {
      await PaymentEvent.updateOne({ _id: event?._id }, { $set: { status: 'ignored', processedAt: new Date() } });
      console.log(`[webhook] ignored eventType=${eventType} event=${eventId}`);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`[webhook] processing FAILED event=${eventId}: ${error.message}`);
    await PaymentEvent.updateOne({ _id: event?._id }, { $set: { status: 'failed', error: error.message } });
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
};
