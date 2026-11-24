const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345684",
  "user": "665f1a2b8c9d4e0012345678",
  "room": "665f1a2b8c9d4e0012345681",
  "booking": "665f1a2b8c9d4e0012345682",
  "rating": 5,
  "comment": "Clean room and friendly staff.",
  "createdAt": "2026-06-15T09:00:00.000Z",
  "updatedAt": "2026-06-15T09:00:00.000Z"
}
*/
