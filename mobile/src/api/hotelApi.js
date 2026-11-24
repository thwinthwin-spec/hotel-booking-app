/** Hotel calls plus the public room-reviews endpoint. */
import api from './axios';

/** GET /hotels?page&limit&search&city -> { items, page, pages, total } */
export const fetchHotelsApi = (params = {}) => api.get('/hotels', { params });
export const fetchHotelByIdApi = (id) => api.get(`/hotels/${id}`);

// Admin hotel CRUD (kept here for future admin screens).
export const createHotelApi = (data) => api.post('/hotels', data);
export const updateHotelApi = (id, data) => api.put(`/hotels/${id}`, data);
export const deleteHotelApi = (id) => api.delete(`/hotels/${id}`);

/** GET /reviews/room/:roomId -> { items } */
export const fetchRoomReviewsApi = (roomId) => api.get(`/reviews/room/${roomId}`);
