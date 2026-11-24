/**
 * Display helpers for dates, money, and booking status.
 * Usage: import { formatDate, formatCurrency } from '../utils/formatters';
 */
import { STATUS_COLORS, COLORS } from './constants';

/** Format a date string/Date as e.g. "Jan 5, 2026"; returns '—' when empty. */
export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an amount as Myanmar Kyat, e.g. "MMK 120,000". */
export function formatCurrency(amount) {
  const number = Number(amount) || 0;
  return `MMK ${number.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Whole nights between two YYYY-MM-DD strings (never negative). */
export function formatNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
}

/** Return the palette colour for a status, with a safe fallback. */
export function statusColor(status) {
  return STATUS_COLORS[status] || COLORS.muted;
}

/** Convert 'checked_in' -> 'Checked In' for status pills/labels. */
export function statusLabel(status) {
  if (!status) return 'Unknown';
  return String(status)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
