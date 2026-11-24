const router = require('express').Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const createRules = [
  body('hotelId').notEmpty().withMessage('hotelId is required'),
  body('roomId').notEmpty().withMessage('roomId is required'),
  body('checkIn').notEmpty().withMessage('checkIn is required'),
  body('checkOut').notEmpty().withMessage('checkOut is required'),
  body('adults').optional().isInt({ min: 0 }).withMessage('adults must be a positive number'),
  body('children').optional().isInt({ min: 0 }).withMessage('children must be a positive number')
];

router.use(auth); // every booking route is protected

// Static paths first so they are not captured by /:id.
router.get('/my', bookingController.getMyBookings);

// Staff-only list with filters
router.get('/', authorize('admin', 'staff'), bookingController.getAllBookings);

router.post('/', validate(createRules), bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id/status', authorize('admin', 'staff'), bookingController.updateBookingStatus);

module.exports = router;
