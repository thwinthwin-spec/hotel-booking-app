const stripe = require('../config/stripe');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

function isOwnerOrStaff(req, booking) {
  return booking.user.toString() === req.user.id || ['admin', 'staff'].includes(req.user.role);
}

// POST /api/payments/create-intent
const createIntent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!isOwnerOrStaff(req, booking)) {
      return res.status(403).json({ message: 'Not allowed to pay for this booking' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Stripe expects the smallest currency unit (cents).
    const amount = Math.round(booking.totalPrice * 100);
    const currency = 'usd';

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      description: `Hotel booking ${booking._id}`,
      metadata: { bookingId: booking._id.toString(), userId: req.user.id }
    });

    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: booking.user,
          amount: booking.totalPrice,
          currency,
          stripePaymentIntentId: intent.id,
          status: 'pending',
          method: 'stripe'
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount,
      currency,
      payment
    });
  } catch (error) {
    console.error('createIntent error:', error.message);
    return res.status(500).json({ message: 'Could not create payment intent' });
  }
};

// POST /api/payments/webhook
// IMPORTANT: server.js mounts this with express.raw() BEFORE express.json().
const stripeWebhook = async (req, res) => {
  try {
    let event;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];

    if (secret && signature) {
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, secret);
      } catch (error) {
        return res.status(400).json({ message: `Webhook signature failed: ${error.message}` });
      }
    } else {
      // Dev convenience only. Never skip verification in production.
      console.warn('[webhook] STRIPE_WEBHOOK_SECRET missing - parsing without signature verification');
      let raw = req.body;
      if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
      if (typeof raw === 'string') {
        try {
          event = JSON.parse(raw || '{}');
        } catch (error) {
          return res.status(400).json({ message: 'Invalid webhook payload' });
        }
      } else {
        event = raw || {};
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = (event.data && event.data.object) || {};
      const bookingId = intent.metadata && intent.metadata.bookingId;
      const intentId = intent.id || '';

      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          const amount = intent.amount_received
            ? intent.amount_received / 100
            : booking.totalPrice;

          await Payment.findOneAndUpdate(
            { booking: booking._id },
            {
              $set: {
                user: booking.user,
                amount,
                currency: intent.currency || booking.currency || 'usd',
                stripePaymentIntentId: intentId,
                status: 'succeeded',
                method: 'stripe'
              }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
          );

          await Booking.findByIdAndUpdate(booking._id, {
            $set: { paymentStatus: 'paid', status: 'confirmed' }
          });
          console.log(`[webhook] booking ${booking._id} marked paid`);
        } else {
          console.warn(`[webhook] booking ${bookingId} not found`);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// POST /api/payments/cash
const payCash = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!isOwnerOrStaff(req, booking)) {
      return res.status(403).json({ message: 'Not allowed to pay for this booking' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }

    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: booking.user,
          amount: booking.totalPrice,
          currency: 'usd',
          status: 'succeeded',
          method: 'cash'
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    booking.paymentMethod = 'cash';
    booking.paymentStatus = 'paid';
    if (booking.status === 'pending') booking.status = 'confirmed';
    await booking.save();

    return res.status(200).json({ message: 'Cash payment recorded', payment, booking });
  } catch (error) {
    console.error('payCash error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createIntent, stripeWebhook, payCash };
