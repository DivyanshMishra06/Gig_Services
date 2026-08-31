const Review = require('../models/Review');
const Worker = require('../models/Worker');

exports.createReview = async (req, res) => {
  try {
    const { workerId, bookingId, rating, comment, serviceQuality, professionalism, punctuality, serviceName } = req.body;

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      workerId,
      rating,
      comment,
      serviceQuality,
      professionalism,
      punctuality,
      customerName: req.user.name,
      serviceName
    });

    // Update worker average rating
    const worker = await Worker.findById(workerId);
    if (worker) {
      const totalRating = worker.rating * worker.totalRatings + rating;
      worker.totalRatings += 1;
      worker.rating = Math.round((totalRating / worker.totalRatings) * 10) / 10;
      await worker.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
