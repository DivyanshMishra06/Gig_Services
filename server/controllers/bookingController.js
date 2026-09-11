const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Invoice = require('../models/Invoice');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');

const PLATFORM_COMMISSION_BPS = 500; // 5%; replace with a versioned pricing policy when configurable.

const idsMatch = (left, right) => String(left) === String(right);

const resolveBookingPricing = async ({ worker, serviceId, serviceName }) => {
  let catalogService = null;
  let selectedService = String(serviceName || '').trim();

  if (serviceId) {
    catalogService = await Service.findOne({ _id: serviceId, isActive: true });
    if (!catalogService) {
      const error = new Error('Selected service is not available');
      error.statusCode = 400;
      throw error;
    }
    if (selectedService && selectedService.toLowerCase() !== catalogService.name.toLowerCase()) {
      const error = new Error('Selected service details do not match');
      error.statusCode = 400;
      throw error;
    }
    selectedService = catalogService.name;
  }

  if (!selectedService) selectedService = worker.primarySkill || '';
  const workerServices = [...(worker.skills || []), worker.primarySkill].filter(Boolean);
  const offered = workerServices.some(skill => skill.toLowerCase() === selectedService.toLowerCase());
  if (!offered) {
    const error = new Error('This worker does not offer the selected service');
    error.statusCode = 400;
    throw error;
  }

  const workerPrice = Number(worker.startingPrice);
  const catalogPrice = Number(catalogService?.basePrice);
  const rupeePrice = Number.isFinite(workerPrice) && workerPrice > 0
    ? workerPrice
    : catalogPrice;
  if (!Number.isFinite(rupeePrice) || rupeePrice <= 0) {
    const error = new Error('A valid service price is not configured for this worker');
    error.statusCode = 422;
    throw error;
  }

  const amount = Math.round(rupeePrice * 100);
  const platformCommission = Math.round((amount * PLATFORM_COMMISSION_BPS) / 10000);
  return {
    serviceName: selectedService,
    displayPrice: amount / 100,
    amount,
    platformCommission,
    workerPayout: amount - platformCommission,
    currency: 'INR',
    source: Number.isFinite(workerPrice) && workerPrice > 0 ? 'worker_starting_price' : 'service_base_price'
  };
};

const assertBookingAccess = async (req, booking) => {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'customer') return idsMatch(booking.customerId, req.user._id);
  if (req.user.role === 'worker') {
    const worker = await Worker.findOne({ userId: req.user._id }).select('_id');
    return Boolean(worker && idsMatch(booking.workerId, worker._id));
  }
  return false;
};

exports.createBooking = async (req, res) => {
  try {
    const { workerId, serviceId, serviceName, description, address, date, time, notes, isEmergency } = req.body;

    const worker = await Worker.findById(workerId).populate('userId', 'name');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (worker.verificationStatus !== 'verified' || worker.availability === 'offline') {
      return res.status(409).json({ message: 'This worker is not currently available for bookings' });
    }

    // Price is always derived from server-side worker/service data. Client input
    // such as estimatedPrice is intentionally ignored.
    const pricing = await resolveBookingPricing({ worker, serviceId, serviceName });

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId,
      serviceId,
      serviceName: pricing.serviceName,
      description,
      address,
      date,
      time,
      pricing: { ...pricing, baseAmount: pricing.amount, quotedAt: new Date() },
      amount: pricing.amount,
      platformCommission: pricing.platformCommission,
      workerPayout: pricing.workerPayout,
      currency: pricing.currency,
      status: 'awaiting_payment',
      paymentStatus: 'not_started',
      refundStatus: 'none',
      estimatedPrice: pricing.displayPrice,
      notes,
      isEmergency: isEmergency || false,
      customerName: req.user.name,
      workerName: worker.userId?.name || 'Worker',
      timeline: [{ status: 'awaiting_payment', timestamp: new Date(), note: 'Booking created; awaiting payment verification' }]
    });

    // New Razorpay bookings are awaiting payment, so this branch remains false
    // until the verified webhook moves them to pending.
    if (booking.status === 'pending') {
    // Create notification for worker
    await Notification.create({
      userId: worker.userId._id || worker.userId,
      title: isEmergency ? '🚨 Emergency Booking Request!' : 'New Booking Request',
      message: `${req.user.name} has requested ${pricing.serviceName} service`,
      type: isEmergency ? 'emergency' : 'booking',
      relatedBookingId: booking._id
    });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status, isEmergency } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ userId: req.user._id });
      if (worker) query.workerId = worker._id;
    }
    // Admin sees all bookings

    if (status) query.status = status;
    if (isEmergency === 'true') query.isEmergency = true;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!await assertBookingAccess(req, booking)) return res.status(403).json({ message: 'Not authorized to view this booking' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const transitions = {
      awaiting_payment: [],
      pending: ['accepted', 'cancelled'],
      accepted: ['on_the_way', 'cancelled'],
      on_the_way: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
      cancelled: []
    };
    if (!transitions[booking.status]?.includes(status)) {
      return res.status(409).json({ message: `Cannot change a ${booking.status} booking to ${status}` });
    }

    if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ userId: req.user._id }).select('_id');
      if (!worker || !idsMatch(booking.workerId, worker._id)) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
    } else if (req.user.role === 'customer') {
      const customerMayCancel = status === 'cancelled' && ['pending', 'accepted'].includes(booking.status);
      if (!idsMatch(booking.customerId, req.user._id) || !customerMayCancel) {
        return res.status(403).json({ message: 'Customers may only cancel their own pending or accepted bookings' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    booking.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`
    });

    if (status === 'completed') {
      booking.completedAt = new Date();

      const amount = booking.amount ?? Math.round((booking.estimatedPrice || 0) * 100);
      const commission = booking.platformCommission ?? Math.round(amount * PLATFORM_COMMISSION_BPS / 10000);
      const payoutAmount = booking.workerPayout ?? amount - commission;

      // Keep the existing invoice feature, but source it from the immutable
      // server quote. It does not mark a payment as paid.
      const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
      if (!existingInvoice) {
        await Invoice.create({
          bookingId: booking._id,
          customerName: booking.customerName,
          workerName: booking.workerName,
          serviceName: booking.serviceName,
          labourCharge: amount / 100,
          materialCharge: 0,
          platformFee: commission / 100,
          cooperativeContribution: 0,
          total: amount / 100
        });
      }
      booking.actualPrice = amount / 100;

      const payout = await Payout.findOneAndUpdate(
        { bookingId: booking._id },
        {
          $setOnInsert: {
            bookingId: booking._id,
            workerId: booking.workerId,
            paymentId: booking.latestPaymentId,
            amount: payoutAmount,
            platformCommission: commission,
            currency: booking.currency || 'INR',
            status: booking.paymentStatus === 'paid' ? 'eligible' : 'pending_payment',
            eligibleAt: booking.paymentStatus === 'paid' ? new Date() : undefined
          }
        },
        { new: true, upsert: true }
      );
      booking.payoutId = payout._id;

      // Completion counts as a completed job, but money is not credited here.
      // Future verified-payment/payout code is the only place allowed to credit earnings.
      const worker = await Worker.findById(booking.workerId);
      if (worker) {
        worker.completedJobs += 1;
        await worker.save();
      }
    }

    await booking.save();

    // Notification
    const statusMessages = {
      accepted: 'Your booking has been accepted! Worker will be assigned shortly.',
      on_the_way: 'Your worker is on the way!',
      in_progress: 'Service is now in progress.',
      completed: 'Service has been completed. Please rate the worker.',
      cancelled: 'Booking has been cancelled.'
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: booking.customerId,
        title: `Booking ${status.replace('_', ' ')}`,
        message: statusMessages[status],
        type: 'booking',
        relatedBookingId: booking._id
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!await assertBookingAccess(req, booking)) return res.status(403).json({ message: 'Not authorized to view this invoice' });
    const invoice = await Invoice.findOne({ bookingId: booking._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  // Kept as an explicit compatibility response until a verified gateway flow is
  // implemented. Never allow client input to mark a payment as paid.
  res.status(410).json({ message: 'Invoice payment is unavailable. Payments must be verified by the payment provider.' });
};
