const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

// GET /api/hotels?page=&limit=&search=&city=
const getHotels = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};

    if (req.query.search) {
      filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }
    if (req.query.city) {
      filter.city = { $regex: escapeRegex(req.query.city), $options: 'i' };
    }

    const [hotelDocs, total] = await Promise.all([
      Hotel.find(filter)
        .populate('amenities', 'name icon category')
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Hotel.countDocuments(filter)
    ]);

    // Cheapest room price becomes the hotel's "from" price in list cards.
    const priceRows = await Room.aggregate([
      { $match: { hotel: { $in: hotelDocs.map((hotel) => hotel._id) } } },
      { $group: { _id: '$hotel', priceFrom: { $min: '$pricePerNight' } } }
    ]);
    const priceByHotel = new Map(
      priceRows.map((row) => [String(row._id), row.priceFrom])
    );
    const items = hotelDocs.map((hotel) => ({
      ...hotel.toObject(),
      priceFrom: priceByHotel.get(String(hotel._id)) || 0
    }));

    return res.status(200).json({
      items,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('getHotels error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/hotels/:id - hotel plus its rooms attached manually
const getHotelById = async (req, res) => {
  try {
    const hotelDoc = await Hotel.findById(req.params.id).populate('amenities', 'name icon category');
    if (!hotelDoc) return res.status(404).json({ message: 'Hotel not found' });

    const rooms = await Room.find({ hotel: hotelDoc._id })
      .populate('amenities', 'name icon category')
      .sort({ roomNumber: 1 });

    const hotel = hotelDoc.toObject();
    hotel.rooms = rooms;
    const prices = rooms.map((room) => room.pricePerNight).filter((price) => Number.isFinite(price));
    hotel.priceFrom = prices.length ? Math.min(...prices) : 0;
    return res.status(200).json(hotel);
  } catch (error) {
    console.error('getHotelById error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/hotels (admin)
const createHotel = async (req, res) => {
  try {
    const { name, description, address, city, country, images, rating, amenities, contact } = req.body;
    const hotel = await Hotel.create({
      name,
      description: description || '',
      address: address || '',
      city: city || '',
      country: country || '',
      images: Array.isArray(images) ? images : [],
      rating: rating === undefined ? 0 : rating,
      amenities: Array.isArray(amenities) ? amenities : [],
      contact: contact || {},
      createdBy: req.user.id
    });

    return res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    console.error('createHotel error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/hotels/:id (admin)
const updateHotel = async (req, res) => {
  try {
    const allowed = [
      'name', 'description', 'address', 'city', 'country', 'images', 'rating', 'amenities', 'contact'
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    return res.status(200).json({ message: 'Hotel updated', hotel });
  } catch (error) {
    console.error('updateHotel error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/hotels/:id (admin)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    return res.status(200).json({ message: 'Hotel deleted' });
  } catch (error) {
    console.error('deleteHotel error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getHotels, getHotelById, createHotel, updateHotel, deleteHotel };
