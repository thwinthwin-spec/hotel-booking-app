const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { calculatePrice } = require('../utils/priceCalculator');
const { parseDate } = require('../utils/dateHelper');
const { sendBookingEmail, sendCancellationEmail } = require('../utils/email');

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

function isStaff(req) {
  return req.user.role === 'admin' || req.user.role === 'staff';
}

function populateBooking(query) {
  return query
    .populate('hotel', 'name city address images')
    .populate('room', 'roomNumber type pricePerNight images')
    .populate('user', 'name email phone');
}

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, adults, children, specialRequests } = req.body;

    // 1. Validate dates and pricing first (cheap, no DB writes).
    let pricing;
    try {
      pricing = calculatePrice(checkIn, checkOut, 0); // real price applied below
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.hotel.toString() !== hotel._id.toString()) {
      return res.status(400).json({ message: 'Room does not belong to this hotel' });
    }
    if (room.isAvailable === false) {
      return res.status(409).json({ message: 'Room is not available' });
    }

    const start = parseDate(checkIn);
    const end = parseDate(checkOut);

    // 2. Overlap rule: active bookings only.
    const activeCount = await Booking.countDocuments({
      room: room._id,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });
    if (activeCount >= room.totalRooms) {
      return res.status(409).json({ message: 'Room is unavailable for the selected dates' });
    }

    // 3. Recalculate with the real nightly rate.
    const { nights, subtotal, tax, totalPrice } = calculatePrice(
      checkIn,
      checkOut,
      room.pricePerNight
    );

    const booking = await Booking.create({
      user: req.user.id,
      hotel: hotel._id,
      room: room._id,
      checkIn: start,
      checkOut: end,
      guests: {
        adults: adults === undefined ? 1 : adults,
        children: children === undefined ? 0 : children
      },
      nights,
      pricePerNight: room.pricePerNight,
      subtotal,
      tax,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      specialRequests: specialRequests || ''
    });

    // 4. Confirmation email must never block or break the response.
    const populated = await populateBooking(Booking.findById(booking._id));
    sendBookingEmail(populated).catch(() => {});

    return res.status(201).json({ message: 'Booking created', booking: populated });
  } catch (error) {
    console.error('createBooking error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [items, total] = await Promise.all([
      populateBooking(
        Booking.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit)
      ),
      Booking.countDocuments({ user: req.user.id })
    ]);
    return res.status(200).json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('getMyBookings error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/:id (owner or staff)
const getBookingById = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const owner = booking.user && booking.user._id
      ? booking.user._id.toString() === req.user.id
      : booking.user.toString() === req.user.id;
    if (!owner && !isStaff(req)) {
      return res.status(403).json({ message: 'Not allowed to view this booking' });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error('getBookingById error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id && !isStaff(req)) {
      return res.status(403).json({ message: 'Not allowed to cancel this booking' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking can no longer be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    await booking.save();

    const populated = await populateBooking(Booking.findById(booking._id));
    sendCancellationEmail(populated).catch(() => {});

    return res.status(200).json({ message: 'Booking cancelled', booking: populated });
  } catch (error) {
    console.error('cancelBooking error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings (admin/staff) with status/paymentStatus/from/to filters
const getAllBookings = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = parseDate(req.query.from);
      if (req.query.to) filter.createdAt.$lte = parseDate(req.query.to);
    }

    const [items, total] = await Promise.all([
      populateBooking(Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
      Booking.countDocuments(filter)
    ]);
    return res.status(200).json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('getAllBookings error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Allowed forward transitions. Cancellation is handled separately.
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: []
};

// PUT /api/bookings/:id/status (admin/staff)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition: ${booking.status} -> ${status}`
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = req.body.cancellationReason || 'Cancelled by staff';
    }
    await booking.save();

    return res.status(200).json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('updateBookingStatus error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Exported for reuse in admin dashboard if needed.
module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  ALLOWED_TRANSITIONS
};
