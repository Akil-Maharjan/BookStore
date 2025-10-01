import axios from 'axios';
import { useAuth } from '../store/auth.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  try {
    const { token } = useAuth.getState();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (e) {
    if (e) {
      // ignore
    }
  }
  return config;
});

export default api;
