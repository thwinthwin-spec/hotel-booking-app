import api from './axios';

// Rooms are sent as FormData because the API accepts multiple image files.
export function getRooms(params = {}) {
  return api.get('/rooms', { params }).then((response) => response.data);
}

export function createRoom(formData) {
  return api.post('/rooms', formData).then((response) => response.data);
}

export function updateRoom(id, formData) {
  return api.put(`/rooms/${id}`, formData).then((response) => response.data);
}

export function deleteRoom(id) {
  return api.delete(`/rooms/${id}`).then((response) => response.data);
}
