import { apiClient } from '../../services/api';

const handleApiError = (error: any, fallbackMessage: string): never => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

export const authApi = {
  signup: async (signupData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/signup', signupData);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Signup failed');
    } catch (error: any) {
      handleApiError(error, 'Signup failed');
    }
  },

  login: async (email: string, password?: string, mfaMethod?: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        mfaMethod
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (error: any) {
      handleApiError(error, 'Login failed');
    }
  },

  verifyMfa: async (challengeId: string, otp: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'MFA OTP Verification failed');
    } catch (error: any) {
      handleApiError(error, 'MFA OTP Verification failed');
    }
  },

  resendMfa: async (challengeId: string, mfaMethod?: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/mfa/resend', {
        challengeId,
        mfaMethod
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'OTP Resend failed');
    } catch (error: any) {
      handleApiError(error, 'OTP Resend failed');
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiClient.post('/v1/auth/logout', { refreshToken });
    } catch (error: any) {
      handleApiError(error, 'Logout failed');
    }
  }
};

