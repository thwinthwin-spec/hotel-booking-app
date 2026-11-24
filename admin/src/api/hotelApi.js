import api from './axios';

// Standard CRUD for hotels. `params` can carry page/limit.
export function getHotels(params = {}) {
  return api.get('/hotels', { params }).then((response) => response.data);
}

export function getHotel(id) {
  return api.get(`/hotels/${id}`).then((response) => response.data);
}

export function createHotel(payload) {
  return api.post('/hotels', payload).then((response) => response.data);
}

export function updateHotel(id, payload) {
  return api.put(`/hotels/${id}`, payload).then((response) => response.data);
}

export function deleteHotel(id) {
  return api.delete(`/hotels/${id}`).then((response) => response.data);
}
