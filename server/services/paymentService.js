const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured on the server');
    error.statusCode = 503;
    throw error;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const getRazorpayKeyId = () => {
  getRazorpayClient();
  return process.env.RAZORPAY_KEY_ID;
};

const createRazorpayOrder = async ({ amount, currency, receipt, bookingId }) => {
  const client = getRazorpayClient();
  return client.orders.create({
    amount,
    currency,
    receipt,
    notes: { booking_id: String(bookingId) }
  });
};

const verifyRazorpayWebhook = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  if (!signature || !Buffer.isBuffer(rawBody)) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  const received = Buffer.from(signature, 'utf8');
  const calculated = Buffer.from(expected, 'utf8');
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
};

const hashPayload = rawBody => crypto.createHash('sha256').update(rawBody).digest('hex');

module.exports = { createRazorpayOrder, getRazorpayKeyId, verifyRazorpayWebhook, hashPayload };
