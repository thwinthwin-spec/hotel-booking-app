const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '', index: true },
    country: { type: String, default: '' },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345679",
  "name": "Aureum Yangon Hotel",
  "description": "Comfortable stay in the heart of Yangon.",
  "address": "12 Bogyoke Road",
  "city": "Yangon",
  "country": "Myanmar",
  "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"],
  "rating": 4.5,
  "amenities": ["665f1a2b8c9d4e0012345680"],
  "contact": { "phone": "+95 1 234 567", "email": "yangon@aureum.test" },
  "createdBy": "665f1a2b8c9d4e0012345677",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
*/
