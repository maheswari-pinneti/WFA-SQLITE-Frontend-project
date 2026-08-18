import { LOCAL_STORAGE_KEYS } from '../../shared/constants/constants';

export interface RequestConfig {
  headers?: Record<string, string>;
  [key: string]: any;
}

export function attachAuthInterceptor(config: RequestConfig): RequestConfig {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  const headers = config.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['X-Client-Platform'] = 'WFA-Enterprise';
  return { ...config, headers };
}

export function setupAuthInterceptors(): void {
  // Global auth interceptor setup hook
}
