// Protects routes with a Bearer JWT. On success req.user = { id, role }.
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_only_change_me_please_1234567890'
    );
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (error) {
    // jwt.verify throws TokenExpiredError for expired tokens.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
