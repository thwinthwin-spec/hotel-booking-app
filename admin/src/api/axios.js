import axios from 'axios';

// All requests go through this single instance so auth + errors behave the same everywhere.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  // No default Content-Type: axios sets JSON for objects and the correct
  // multipart boundary automatically when we send FormData (rooms upload).
});

// Attach the JWT to every outgoing request if we have one saved.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Expired / invalid token: clear the session and bounce to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Pull a readable message out of an axios error for display in the UI. */
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export default api;
