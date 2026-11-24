const Booking = require('../models/Booking');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalBookings, totalUsers, totalHotels, totalRooms, revenueResult, recentBookings] =
      await Promise.all([
        Booking.countDocuments(),
        User.countDocuments(),
        Hotel.countDocuments(),
        Room.countDocuments(),
        Booking.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        Booking.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email')
          .populate('hotel', 'name city')
          .populate('room', 'roomNumber type')
      ]);

    const activeBookings = await Booking.countDocuments({
      status: { $in: ['confirmed', 'checked_in'] }
    });

    const occupancyRate = totalBookings === 0
      ? 0
      : Math.round((activeBookings / totalBookings) * 1000) / 10;

    return res.status(200).json({
      totalBookings,
      totalRevenue: revenueResult.length ? revenueResult[0].total : 0,
      occupancyRate,
      totalUsers,
      totalHotels,
      totalRooms,
      recentBookings
    });
  } catch (error) {
    console.error('getDashboard error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [items, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);
    return res.status(200).json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('getUsers error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['guest', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    console.error('updateUserRole error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getUsers, updateUserRole };
