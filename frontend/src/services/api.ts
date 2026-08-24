import axios from 'axios';
import { STORAGE_KEYS } from '../shared/constants/constants';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url && (
      originalRequest.url.includes('/auth/') ||
      originalRequest.url.includes('/login')
    );

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${apiClient.defaults.baseURL || ''}/v1/auth/refresh`, {}, { withCredentials: true });
        if (res.data && res.data.success && res.data.data?.token) {
          const newToken = res.data.data.token;
          
          setAccessToken(newToken);
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          refreshQueue.forEach((callback) => callback(newToken));
          refreshQueue = [];
          
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to auto-refresh access token:', refreshError);
      } finally {
        isRefreshing = false;
      }

      // If refresh failed, perform secure logout redirect
      setAccessToken(null);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);
