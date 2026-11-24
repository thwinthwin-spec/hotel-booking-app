import api from './axios';

// Returns { token, user } on success.
export function login(credentials) {
  return api.post('/auth/login', credentials).then((response) => response.data);
}

// Useful for verifying a stored token on app boot.
export function getMe() {
  return api.get('/auth/me').then((response) => response.data);
}
