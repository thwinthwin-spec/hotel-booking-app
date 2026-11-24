const router = require('express').Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

router.use(auth);

router.get('/dashboard', authorize('admin', 'staff'), adminController.getDashboard);
router.get('/users', authorize('admin'), adminController.getUsers);

router.put(
  '/users/:id/role',
  authorize('admin'),
  validate([body('role').isIn(['guest', 'staff', 'admin']).withMessage('Invalid role')]),
  adminController.updateUserRole
);

module.exports = router;
