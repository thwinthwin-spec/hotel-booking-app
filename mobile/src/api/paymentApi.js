/** Payment calls. Stripe is test-mode only: we show the clientSecret to the user. */
import api from './axios';

export const createPaymentIntentApi = (bookingId) =>
  api.post('/payments/create-intent', { bookingId });
export const payCashApi = (bookingId) =>
  api.post('/payments/cash', { bookingId });
