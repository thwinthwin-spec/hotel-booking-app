const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    guests: {
      adults: { type: Number, default: 1, min: 0 },
      children: { type: Number, default: 0, min: 0 }
    },
    nights: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'cash'],
      default: 'cash'
    },
    specialRequests: { type: String, default: '' },
    cancellationReason: { type: String, default: '' }
  },
  { timestamps: true }
);

// Used by the availability overlap query and by the room listings.
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345682",
  "user": "665f1a2b8c9d4e0012345678",
  "hotel": "665f1a2b8c9d4e0012345679",
  "room": "665f1a2b8c9d4e0012345681",
  "checkIn": "2026-06-10T00:00:00.000Z",
  "checkOut": "2026-06-13T00:00:00.000Z",
  "guests": { "adults": 2, "children": 0 },
  "nights": 3,
  "pricePerNight": 75000,
  "subtotal": 225000,
  "tax": 22500,
  "totalPrice": 247500,
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "specialRequests": "Quiet floor please.",
  "cancellationReason": "",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
*/
