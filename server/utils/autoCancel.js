// Runs once per minute and cancels stale pending/unpaid bookings (30 minutes).
const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendCancellationEmail } = require('./email');

const CANCEL_REASON = 'Automatically cancelled: payment not received within 30 minutes';
let started = false;

function startAutoCancelJob() {
  if (started) return null; // avoid duplicate jobs with nodemon restarts in-process
  started = true;

  const task = cron.schedule('* * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const stale = await Booking.find({
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: { $lt: cutoff }
      })
        .populate('user', 'name email')
        .populate('hotel', 'name')
        .populate('room', 'roomNumber');

      if (stale.length === 0) return;

      await Booking.updateMany(
        { _id: { $in: stale.map((booking) => booking._id) } },
        { $set: { status: 'cancelled', cancellationReason: CANCEL_REASON } }
      );

      // Emails are deliberately fire-and-forget.
      stale.forEach((booking) => sendCancellationEmail(booking).catch(() => {}));
      console.log(`[autoCancel] cancelled ${stale.length} stale booking(s)`);
    } catch (error) {
      console.error('[autoCancel] job error:', error.message);
    }
  });

  console.log('[autoCancel] scheduled every minute');
  return task;
}

module.exports = startAutoCancelJob;
