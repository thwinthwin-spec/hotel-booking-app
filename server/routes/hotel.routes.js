const router = require('express').Router();
const { body } = require('express-validator');
const hotelController = require('../controllers/hotel.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

// Public listing + detail
router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);

// Admin-only mutations
router.post(
  '/',
  auth,
  authorize('admin'),
  validate([body('name').trim().notEmpty().withMessage('Hotel name is required')]),
  hotelController.createHotel
);

router.put('/:id', auth, authorize('admin'), hotelController.updateHotel);
router.delete('/:id', auth, authorize('admin'), hotelController.deleteHotel);

module.exports = router;
