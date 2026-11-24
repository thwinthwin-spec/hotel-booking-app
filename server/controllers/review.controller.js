const Review = require('../models/Review');
const Booking = require('../models/Booking');

// POST /api/reviews - only completed bookings, one review per booking.
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to review this booking' });
    }
    if (booking.status !== 'checked_out') {
      return res.status(400).json({ message: 'You can only review a completed stay' });
    }

    const existing = await Review.findOne({ booking: booking._id });
    if (existing) return res.status(409).json({ message: 'This booking has already been reviewed' });

    const review = await Review.create({
      user: req.user.id,
      room: booking.room,
      booking: booking._id,
      rating,
      comment: comment || ''
    });

    return res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    console.error('createReview error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This booking has already been reviewed' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/room/:roomId
const getRoomReviews = async (req, res) => {
  try {
    const items = await Review.find({ room: req.params.roomId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    console.error('getRoomReviews error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReview, getRoomReviews };
