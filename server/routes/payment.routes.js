const router = require('express').Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// NOTE: the Stripe webhook is deliberately NOT mounted here. server.js registers
// it at the exact path /api/payments/webhook with express.raw() before JSON parsing.

router.use(auth);

const bookingRule = [body('bookingId').notEmpty().withMessage('bookingId is required')];

router.post('/create-intent', validate(bookingRule), paymentController.createIntent);
router.post('/cash', validate(bookingRule), paymentController.payCash);

module.exports = router;
