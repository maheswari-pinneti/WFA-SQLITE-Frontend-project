import { apiClient } from '../../services/api';

export const authApi = {
  signup: async (signupData: any): Promise<any> => {
    const response = await apiClient.post('/v1/auth/signup', signupData);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Signup failed');
  },

  login: async (email: string, password?: string): Promise<any> => {
    const response = await apiClient.post('/v1/auth/login', {
      email: email.trim().toLowerCase(),
      password
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Login failed');
  },

  verifyMfa: async (challengeId: string, otp: string): Promise<any> => {
    const response = await apiClient.post('/v1/auth/mfa/verify', {
      challengeId,
      otp
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'MFA OTP Verification failed');
  },

  resendMfa: async (challengeId: string): Promise<any> => {
    const response = await apiClient.post('/v1/auth/mfa/resend', {
      challengeId
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'OTP Resend failed');
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/v1/auth/logout', { refreshToken });
  }
};
