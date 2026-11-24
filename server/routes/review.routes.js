const router = require('express').Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post(
  '/',
  auth,
  validate([
    body('bookingId').notEmpty().withMessage('bookingId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ]),
  reviewController.createReview
);

router.get('/room/:roomId', reviewController.getRoomReviews);

module.exports = router;
