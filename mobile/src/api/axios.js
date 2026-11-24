/**
 * Shared Axios instance. Attaches the AsyncStorage JWT to every request and
 * clears the session when the server answers 401.
 *
 * NOTE: importing `store` here creates a circular dependency
 * (store -> authSlice -> authApi -> axios). That is intentional and safe:
 * the interceptor callback only runs long after all modules are initialised.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/constants';
import store from '../redux/store';
import { logout } from '../redux/authSlice';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: read the stored token on each call (async storage).
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Storage failures must not block a request.
      console.warn('Could not read auth token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: expired/invalid token -> wipe local session.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.multiRemove(['token', 'user']);
        store.dispatch(logout());
      } catch (storageError) {
        console.warn('Could not clear auth session', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
