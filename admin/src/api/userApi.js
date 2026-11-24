import api from './axios';

// Admin-only user management endpoints.
export function getUsers(params = {}) {
  return api.get('/admin/users', { params }).then((response) => response.data);
}

export function updateUserRole(id, role) {
  return api.put(`/admin/users/${id}/role`, { role }).then((response) => response.data);
}
