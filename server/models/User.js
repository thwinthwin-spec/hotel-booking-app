const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // always bcrypt hashed
    phone: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ['guest', 'staff', 'admin'],
      default: 'guest',
      index: true
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Never leak the password hash when a user is serialized into a response.
userSchema.methods.toJSON = function () {
  const object = this.toObject();
  delete object.password;
  return object;
};

module.exports = mongoose.model('User', userSchema);

/*
Sample document:
{
  "_id": "665f1a2b8c9d4e0012345678",
  "name": "Guest One",
  "email": "guest@test.com",
  "password": "$2a$10$...(bcrypt hash)...",
  "phone": "0912345678",
  "role": "guest",
  "avatar": "",
  "isActive": true,
  "createdAt": "2026-06-03T10:00:00.000Z",
  "updatedAt": "2026-06-03T10:00:00.000Z"
}
*/
