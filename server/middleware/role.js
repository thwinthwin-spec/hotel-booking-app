// Usage: router.get('/x', auth, authorize('admin', 'staff'), handler)
function authorize(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    return next();
  };
}

module.exports = { authorize };
