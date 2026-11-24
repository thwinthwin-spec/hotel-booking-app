const mongoose = require('mongoose');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { uploadRoomImages } = require('../config/cloudinary');
const { parseDate } = require('../utils/dateHelper');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

// Multipart bodies send arrays/objects as strings; JSON bodies do not.
function parseJsonField(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function buildRoomData(body) {
  const data = {};
  const allowed = ['hotel', 'roomNumber', 'type', 'pricePerNight', 'totalRooms', 'isAvailable', 'description'];
  allowed.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });

  const capacity = parseJsonField(body.capacity, null);
  if (capacity && typeof capacity === 'object') {
    data.capacity = capacity;
  } else {
    if (body.adults !== undefined) data['capacity.adults'] = body.adults;
    if (body.children !== undefined) data['capacity.children'] = body.children;
  }

  const amenities = parseJsonField(body.amenities, undefined);
  if (amenities !== undefined) {
    data.amenities = Array.isArray(amenities) ? amenities : [amenities];
  }
  return data;
}

// GET /api/rooms with filters and date-based availability.
const getRooms = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};

    if (req.query.hotelId) filter.hotel = req.query.hotelId;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.minPrice !== undefined) {
      filter.pricePerNight = { ...(filter.pricePerNight || {}), $gte: Number(req.query.minPrice) };
    }
    if (req.query.maxPrice !== undefined) {
      filter.pricePerNight = { ...(filter.pricePerNight || {}), $lte: Number(req.query.maxPrice) };
    }
    if (req.query.capacity) {
      filter['capacity.adults'] = { $gte: Number(req.query.capacity) };
    }

    // City filtering requires resolving hotels first.
    if (req.query.city) {
      const hotels = await Hotel.find({
        city: { $regex: escapeRegex(req.query.city), $options: 'i' }
      }).select('_id');
      filter.hotel = { $in: hotels.map((hotel) => hotel._id) };
      if (req.query.hotelId) filter.hotel.$in = [req.query.hotelId];
    }

    let candidates = await Room.find(filter)
      .populate('hotel', 'name city')
      .populate('amenities', 'name icon')
      .sort({ pricePerNight: 1 });

    // Availability: exclude room types whose overlapping active bookings
    // already consume every unit (totalRooms).
    const hasDates = Boolean(req.query.checkIn && req.query.checkOut);
    let checkIn;
    let checkOut;
    if (hasDates) {
      checkIn = parseDate(req.query.checkIn);
      checkOut = parseDate(req.query.checkOut);
      if (checkOut <= checkIn) {
        return res.status(400).json({ message: 'checkOut must be after checkIn' });
      }

      const overlapping = await Booking.find({
        status: { $ne: 'cancelled' },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }).select('room');

      const counts = new Map();
      overlapping.forEach((booking) => {
        const key = booking.room.toString();
        counts.set(key, (counts.get(key) || 0) + 1);
      });

      candidates = candidates.filter((room) => {
        if (room.isAvailable === false) return false;
        const used = counts.get(room._id.toString()) || 0;
        return used < room.totalRooms;
      });
    }

    const total = candidates.length;
    const items = candidates.slice(skip, skip + limit);
    return res.status(200).json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error('getRooms error:', error.message);
    if (error.message === 'Invalid date') {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotel', 'name city address')
      .populate('amenities', 'name icon category');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.status(200).json(room);
  } catch (error) {
    console.error('getRoomById error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/rooms (admin, multipart or JSON)
const createRoom = async (req, res) => {
  try {
    const data = buildRoomData(req.body || {});
    if (!data.hotel || !mongoose.isValidObjectId(data.hotel)) {
      return res.status(400).json({ message: 'A valid hotel id is required' });
    }
    const hotelExists = await Hotel.exists({ _id: data.hotel });
    if (!hotelExists) return res.status(404).json({ message: 'Hotel not found' });

    if (req.files && req.files.length) {
      data.images = await uploadRoomImages(req.files);
    } else if (req.body.images !== undefined) {
      data.images = parseJsonField(req.body.images, []);
    }

    const room = await Room.create(data);
    return res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    console.error('createRoom error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/rooms/:id (admin)
const updateRoom = async (req, res) => {
  try {
    const data = buildRoomData(req.body || {});

    if (req.files && req.files.length) {
      const uploaded = await uploadRoomImages(req.files);
      const existing = parseJsonField(req.body.existingImages, []);
      data.images = [...(Array.isArray(existing) ? existing : []), ...uploaded];
    } else if (req.body.images !== undefined) {
      data.images = parseJsonField(req.body.images, []);
    }

    const room = await Room.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    return res.status(200).json({ message: 'Room updated', room });
  } catch (error) {
    console.error('updateRoom error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/rooms/:id (admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.status(200).json({ message: 'Room deleted' });
  } catch (error) {
    console.error('deleteRoom error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
