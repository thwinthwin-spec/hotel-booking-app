// Small date utilities shared by price calculation, availability and seeding.
// Date-only strings are treated as UTC midnight for consistent day arithmetic.

function parseDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('Invalid date');
    return new Date(value.getTime());
  }
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid date');

  const text = value.trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const date = new Date(dateOnly ? `${text}T00:00:00.000Z` : text);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return date;
}

// Two stays overlap when the first starts before the second ends AND the
// first ends after the second starts (half-open interval logic).
function isOverlapping(aIn, aOut, bIn, bOut) {
  return parseDate(aIn) < parseDate(bOut) && parseDate(aOut) > parseDate(bIn);
}

function addDays(date, days) {
  const result = parseDate(date);
  result.setUTCDate(result.getUTCDate() + Number(days));
  return result;
}

function toDateOnlyString(date) {
  return parseDate(date).toISOString().slice(0, 10);
}

module.exports = { parseDate, isOverlapping, addDays, toDateOnlyString };
