import { authApi } from '../../api/endpoints/auth.api';
import { STORAGE_KEYS } from '../../shared/constants/constants';
import { apiClient } from '../../services/api';
import { Role } from '../../security/roles/roles';

const normalizeUser = (value: any) => {
  if (!value || typeof value !== 'object') return null;
  const knownRoles = Object.values(Role) as string[];
  const normalizedRole = typeof value.role === 'string' ? value.role.toUpperCase() : '';
  if (!knownRoles.includes(normalizedRole)) return null;
  return {
    ...value,
    role: normalizedRole,
    permissions: Array.isArray(value.permissions) ? value.permissions : [],
    department: value.department || '',
    team: value.team || '',
    title: value.title || '',
    status: value.status || 'ACTIVE'
  };
};

export const authService = {
  signup: async (signupData: any) => {
    return await authApi.signup(signupData);
  },

  login: async (email: string, password?: string, mfaMethod?: string) => {
    const response = await authApi.login(email, password, mfaMethod);
    if (response && (response as any).token && (response as any).user) {
      const user = normalizeUser((response as any).user);
      if (!user) throw new Error('Login returned an invalid user session.');
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, (response as any).token);
      if ((response as any).refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, (response as any).refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return { ...(response as any), user };
    }
    return response;
  },

  verifyMfa: async (challengeId: string, code: string) => {
    const data = await authApi.verifyMfa(challengeId, code);
    const { token, refreshToken, user } = data;
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) throw new Error('MFA returned an invalid user session.');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    return { token, user: normalizedUser };
  },

  resendMfa: async (challengeId: string, mfaMethod?: string) => {
    return await authApi.resendMfa(challengeId, mfaMethod);
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  getStoredSession: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (token && userData) {
      try {
        const user = normalizeUser(JSON.parse(userData));
        if (!user) return null;
        return {
          token,
          user
        };
      } catch {
        return null;
      }
    }
    return null;
  }
};
