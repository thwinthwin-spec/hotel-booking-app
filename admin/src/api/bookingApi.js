import api from './axios';

export function getBookings(params = {}) {
  return api.get('/bookings', { params }).then((response) => response.data);
}

// Only the status is editable from the admin panel.
export function updateBookingStatus(id, status) {
  return api.put(`/bookings/${id}/status`, { status }).then((response) => response.data);
}
