// Stripe client in TEST mode. The placeholder key only matters if someone
// forgets .env; API calls will then fail with a clear Stripe error.
require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_replace_me_with_your_test_key'
);

module.exports = stripe;
