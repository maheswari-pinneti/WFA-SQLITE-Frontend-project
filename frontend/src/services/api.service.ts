import { ApiResponse } from '../interfaces';

export class ApiService {
  private static baseUrl = '/api/v1';

  public static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        message: err.message || 'API Request failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public static async post<T>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        message: err.message || 'API POST failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
