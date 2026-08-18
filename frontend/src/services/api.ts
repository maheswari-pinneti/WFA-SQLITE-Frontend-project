import axios from 'axios';
import { STORAGE_KEYS } from '../shared/constants/constants';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthRoute = error.config?.url && (
      error.config.url.includes('/auth/') ||
      error.config.url.includes('/login')
    );
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRoute) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);
