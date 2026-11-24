const router = require('express').Router();
const { body } = require('express-validator');
const roomController = require('../controllers/room.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);

const roomRules = [
  body('hotel').notEmpty().withMessage('Hotel is required'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('pricePerNight').isNumeric({ min: 0 }).withMessage('Valid pricePerNight is required')
];

// upload.array must run before the controller so req.files is populated.
router.post(
  '/',
  auth,
  authorize('admin'),
  upload.array('images', 5),
  validate(roomRules),
  roomController.createRoom
);

router.put(
  '/:id',
  auth,
  authorize('admin'),
  upload.array('images', 5),
  validate([]),
  roomController.updateRoom
);

router.delete('/:id', auth, authorize('admin'), roomController.deleteRoom);

module.exports = router;
