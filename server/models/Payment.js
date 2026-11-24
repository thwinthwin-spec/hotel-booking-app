const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd', lowercase: true },
    stripePaymentIntentId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    method: {
      type: String,
      enum: ['stripe', 'cash'],
      default: 'stripe'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345683",
  "booking": "665f1a2b8c9d4e0012345682",
  "user": "665f1a2b8c9d4e0012345678",
  "amount": 247500,
  "currency": "usd",
  "stripePaymentIntentId": "pi_3PabcXYZ",
  "status": "succeeded",
  "method": "stripe",
  "createdAt": "2026-06-03T10:05:00.000Z",
  "updatedAt": "2026-06-03T10:06:00.000Z"
}
*/
