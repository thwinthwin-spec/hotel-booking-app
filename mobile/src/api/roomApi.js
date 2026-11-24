/** Room search/detail/admin CRUD. Image uploads are sent as multipart FormData. */
import api from './axios';

/** GET /rooms?hotelId&city&minPrice&... -> { items, page, pages, total } */
export const fetchRoomsApi = (params = {}) => api.get('/rooms', { params });
export const fetchRoomByIdApi = (id) => api.get(`/rooms/${id}`);

/**
 * Build multipart data for room create/update.
 * Each field is appended as a string; images (local URIs or remote URLs) are
 * appended under the repeated `images` key expected by the backend.
 */
function buildRoomFormData(data = {}, images = []) {
  const form = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value === undefined || value === null) return;
    // Populated objects (e.g. hotelId: { _id: '...' }) are flattened to id.
    form.append(key, typeof value === 'object' ? value._id || '' : String(value));
  });
  images.forEach((image, index) => {
    if (!image) return;
    const uri = typeof image === 'string' ? image : image.uri;
    if (!uri) return;
    form.append('images', {
      uri,
      name: image.name || `room-image-${index}.jpg`,
      type: image.type || 'image/jpeg',
    });
  });
  return form;
}

export const createRoomApi = (data, images = []) =>
  api.post('/rooms', buildRoomFormData(data, images), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateRoomApi = (id, data, images = []) =>
  api.put(`/rooms/${id}`, buildRoomFormData(data, images), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteRoomApi = (id) => api.delete(`/rooms/${id}`);
