// Pricing rule: tax is a flat 10% of the room subtotal.
const { parseDate } = require('./dateHelper');

function calculatePrice(checkIn, checkOut, pricePerNight) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const price = Number(pricePerNight);

  if (end <= start) throw new Error('checkOut must be after checkIn');
  if (!Number.isFinite(price) || price < 0) throw new Error('Invalid pricePerNight');

  // Inputs are UTC midnights, so this is an exact whole number of days.
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  const subtotal = Math.round(price * nights * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const totalPrice = Math.round((subtotal + tax) * 100) / 100;

  return { nights, subtotal, tax, totalPrice };
}

module.exports = { calculatePrice };
