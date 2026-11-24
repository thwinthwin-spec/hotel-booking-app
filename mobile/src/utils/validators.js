/**
 * Small synchronous form validators. Each returns true when the value is OK.
 * Usage: if (!validateEmail(email)) Alert.alert('Error', 'Invalid email');
 */

/** Basic RFC-ish email shape check. */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

/** Accepts Myanmar numbers (09..., +959...) or generic 7-15 digit phone numbers. */
export function validatePhone(phone) {
  const value = String(phone || '').replace(/[\s-]/g, '').trim();
  if (!value) return false;
  const myanmar = /^(?:\+?959|09)\d{7,9}$/.test(value);
  const generic = /^\+?\d{7,15}$/.test(value);
  return myanmar || generic;
}

/** Password must be at least 6 characters. */
export function validatePassword(password) {
  return String(password || '').length >= 6;
}

/** Generic non-empty (after trimming) check. */
export function validateRequired(value) {
  return String(value == null ? '' : value).trim().length > 0;
}
