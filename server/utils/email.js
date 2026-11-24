// Email helpers. If SMTP is not configured we use Nodemailer's jsonTransport
// and log the message, which makes local development work without a mail server.
// These helpers swallow their own errors: email must never break a request.
require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_FROM = process.env.EMAIL_FROM || 'Hotel Booking <no-reply@hotelbooking.local>';
const smtpReady = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
);

const transporter = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : nodemailer.createTransport({ jsonTransport: true });

if (!smtpReady) {
  console.log('[email] SMTP not configured - emails are logged to the console only.');
}

function safeDate(value) {
  if (!value) return 'N/A';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toISOString().slice(0, 10);
}

// Single place that performs the send and guarantees no exception escapes.
async function safeSend(mailOptions) {
  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM, ...mailOptions });
    if (!smtpReady) {
      const preview = typeof info.message === 'string' ? info.message : String(info.message || '');
      console.log(`[email] preview for ${mailOptions.to}: ${preview.slice(0, 400)}`);
    }
    return true;
  } catch (error) {
    console.error('[email] could not send message:', error.message);
    return false;
  }
}

// booking may be a Mongoose document or a plain object with populated refs.
async function sendBookingEmail(booking) {
  if (!booking) return false;
  const to = booking.user && booking.user.email ? booking.user.email : process.env.SMTP_USER;
  if (!to) return false;

  const hotelName = booking.hotel && booking.hotel.name ? booking.hotel.name : 'our hotel';
  const roomName = booking.room && booking.room.roomNumber
    ? `Room ${booking.room.roomNumber}`
    : 'your room';

  return safeSend({
    to,
    subject: `Booking confirmation - ${hotelName}`,
    text: [
      `Hello ${booking.user && booking.user.name ? booking.user.name : 'there'},`,
      '',
      `Your booking at ${hotelName} has been received.`,
      `Room: ${roomName}`,
      `Check-in: ${safeDate(booking.checkIn)}`,
      `Check-out: ${safeDate(booking.checkOut)}`,
      `Nights: ${booking.nights || 'N/A'}`,
      `Total: ${booking.totalPrice || 0} MMK`,
      `Status: ${booking.status}`,
      '',
      'Thank you for choosing us.'
    ].join('\n')
  });
}

async function sendCancellationEmail(booking) {
  if (!booking) return false;
  const to = booking.user && booking.user.email ? booking.user.email : process.env.SMTP_USER;
  if (!to) return false;

  return safeSend({
    to,
    subject: 'Your booking has been cancelled',
    text: [
      `Hello ${booking.user && booking.user.name ? booking.user.name : 'there'},`,
      '',
      `Booking ${booking._id} was cancelled.`,
      booking.cancellationReason ? `Reason: ${booking.cancellationReason}` : '',
      'If you did not request this, please contact our front desk.'
    ].filter(Boolean).join('\n')
  });
}

module.exports = { sendBookingEmail, sendCancellationEmail, transporter };
