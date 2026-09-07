const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Worker = require('./models/Worker');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Payout = require('./models/Payout');
const PaymentEvent = require('./models/PaymentEvent');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
];

// Add production origins from CLIENT_URL env var (comma-separated)
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').map(s => s.trim()).forEach(origin => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Razorpay signs the raw request bytes. This must precede express.json().
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').handleWebhook);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;

const hasValidGeoPoint = location => Array.isArray(location?.coordinates) &&
  location.coordinates.length === 2 &&
  Number.isFinite(location.coordinates[0]) && Number.isFinite(location.coordinates[1]) &&
  location.coordinates[0] >= -180 && location.coordinates[0] <= 180 &&
  location.coordinates[1] >= -90 && location.coordinates[1] <= 90;

const repairInvalidWorkerLocations = async () => {
  const workers = await Worker.find({ location: { $exists: true } }).select('_id location').lean();
  const invalidWorkerIds = workers
    .filter(worker => !hasValidGeoPoint(worker.location))
    .map(worker => worker._id);

  if (invalidWorkerIds.length) {
    await Worker.updateMany(
      { _id: { $in: invalidWorkerIds } },
      { $unset: { location: 1 } }
    );
    console.log(`Removed invalid location data from ${invalidWorkerIds.length} worker profile(s).`);
  }
};

const initializeDatabase = async () => {
  const connected = await connectDB();
  // Create the GeoJSON index before accepting nearby-worker requests. This is
  // safe for existing records without a location; MongoDB simply omits them.
  if (connected) {
    try {
      await repairInvalidWorkerLocations();
      await Promise.all([
        Worker.createIndexes(),
        Booking.createIndexes(),
        Payment.createIndexes(),
        Payout.createIndexes(),
        PaymentEvent.createIndexes()
      ]);
    } catch (error) {
      console.error(`Database initialization error: ${error.message}`);
    }
  }
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });

  // Do not make the HTTP server wait for a remote database connection. This
  // keeps health checks and the Vite proxy reachable while MongoDB connects.
  initializeDatabase();
};

startServer();
