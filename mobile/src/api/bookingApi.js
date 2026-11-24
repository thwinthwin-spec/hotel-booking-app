/** Booking calls for guests and admins, plus POST /reviews. */
import api from './axios';

export const createBookingApi = (data) => api.post('/bookings', data);
export const fetchMyBookingsApi = (params = {}) =>
  api.get('/bookings/my', { params });
export const fetchBookingByIdApi = (id) => api.get(`/bookings/${id}`);
export const cancelBookingApi = (id) => api.put(`/bookings/${id}/cancel`);

// Admin endpoints.
export const fetchAllBookingsApi = (params = {}) =>
  api.get('/bookings', { params });
export const updateBookingStatusApi = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });

/** POST /reviews { bookingId, rating, comment } -> { message, review } */
export const createReviewApi = (data) => api.post('/reviews', data);
