const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true
    },
    roomNumber: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe'],
      default: 'single'
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: {
      adults: { type: Number, default: 1, min: 0 },
      children: { type: Number, default: 0, min: 0 }
    },
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    images: [{ type: String }],
    totalRooms: { type: Number, default: 1, min: 1 },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

// A hotel cannot have two room records with the same room number.
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345681",
  "hotel": "665f1a2b8c9d4e0012345679",
  "roomNumber": "101",
  "type": "deluxe",
  "pricePerNight": 75000,
  "capacity": { "adults": 2, "children": 1 },
  "amenities": ["665f1a2b8c9d4e0012345680"],
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/hotel-booking/rooms/a.jpg"],
  "totalRooms": 3,
  "isAvailable": true,
  "description": "City view with king bed.",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
*/
