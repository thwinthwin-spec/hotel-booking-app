const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: '' },
    category: { type: String, default: 'general', trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Amenity', amenitySchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345680",
  "name": "WiFi",
  "icon": "📶",
  "category": "connectivity",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
*/
