// JWTs carry only the id and role; controllers re-load the user from MongoDB
// so role changes take effect even while an old token is still valid.
const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_only_change_me_please_1234567890', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

module.exports = generateToken;
