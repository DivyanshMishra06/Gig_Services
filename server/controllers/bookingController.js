const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

exports.createBooking = async (req, res) => {
  try {
    const { workerId, serviceId, serviceName, description, address, date, time, estimatedPrice, notes, isEmergency } = req.body;

    const worker = await Worker.findById(workerId).populate('userId', 'name');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId,
      serviceId,
      serviceName,
      description,
      address,
      date,
      time,
      estimatedPrice,
      notes,
      isEmergency: isEmergency || false,
      customerName: req.user.name,
      workerName: worker.userId?.name || 'Worker',
      timeline: [{ status: 'pending', timestamp: new Date(), note: 'Booking created' }]
    });

    // Create notification for worker
    await Notification.create({
      userId: worker.userId._id || worker.userId,
      title: isEmergency ? '🚨 Emergency Booking Request!' : 'New Booking Request',
      message: `${req.user.name} has requested ${serviceName} service`,
      type: isEmergency ? 'emergency' : 'booking',
      relatedBookingId: booking._id
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    booking.status = status;
    booking.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`
    });

    if (status === 'completed') {
      booking.completedAt = new Date();

      // Generate invoice
      const labourCharge = booking.estimatedPrice || 400;
      const materialCharge = Math.round(labourCharge * 0.2);
      const platformFee = Math.round(labourCharge * 0.05);
      const cooperativeContribution = Math.round(labourCharge * 0.03);
      const total = labourCharge + materialCharge;

      await Invoice.create({
        bookingId: booking._id,
        customerName: booking.customerName,
        workerName: booking.workerName,
        serviceName: booking.serviceName,
        labourCharge,
        materialCharge,
        platformFee,
        cooperativeContribution,
        total
      });

      booking.actualPrice = total;

      // Update worker stats
      const worker = await Worker.findById(booking.workerId);
      if (worker) {
        worker.completedJobs += 1;
        worker.earnings.today += total;
        worker.earnings.weekly += total;
        worker.earnings.monthly += total;
        worker.earnings.total += total;
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
    const invoice = await Invoice.findOne({ bookingId: req.params.bookingId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    invoice.paymentStatus = 'paid';
    invoice.paymentMethod = req.body.method || 'UPI';
    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
