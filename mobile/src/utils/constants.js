/**
 * Shared constants, design tokens, and API base URL for the whole app.
 * Usage: import { COLORS, API_URL } from '../utils/constants';
 *
 * API_URL can be overridden with EXPO_PUBLIC_API_URL before starting Expo.
 * - Android emulator: http://10.0.2.2:5000/api (the default below)
 * - iOS simulator:    http://localhost:5000/api
 * - Real device:      http://<your-LAN-IP>:5000/api (same Wi-Fi as the server)
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

/** Single palette used by every screen/component so styling stays consistent. */
export const COLORS = {
  primary: '#0E7C5A',
  accent: '#F2B544',
  background: '#F7F8FA',
  text: '#14261D',
  muted: '#6B7C73',
  border: '#E3E8E5',
  danger: '#C0392B',
  white: '#FFFFFF',
};

/** Booking status -> colour mapping (used by status pills in cards/details). */
export const STATUS_COLORS = {
  pending: '#D68910',
  confirmed: '#0E7C5A',
  checked_in: '#2471A3',
  checked_out: '#6B7C73',
  cancelled: '#C0392B',
  paid: '#0E7C5A',
};

/** Room types offered by the hotel (used in filters and admin forms). */
export const ROOM_TYPES = ['Standard', 'Superior', 'Deluxe', 'Suite', 'Family'];

/** All booking statuses understood by the backend. */
export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
];

/** Friendly greeting exported for the splash/home screens. */
export const hello = 'Welcome to Hotel Booking';
