require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const routes = require('./routes');
const paymentController = require('./controllers/payment.controller');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const startAutoCancelJob = require('./utils/autoCancel');

// Development-friendly defaults. Always override JWT_SECRET in production.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me_please_1234567890';

const app = express();

// CORS: CLIENT_ORIGIN may be a comma-separated list or '*'.
const origins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: origins.length === 1 && origins[0] === '*' ? '*' : origins,
  credentials: true
}));
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// Stripe webhook MUST be registered before express.json() so the raw body is
// preserved for signature verification.
// ---------------------------------------------------------------------------
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (LAN ready)`);
    startAutoCancelJob();
  });
});
