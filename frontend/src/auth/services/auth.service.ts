import { authApi } from '../../api/endpoints/auth.api';
import { STORAGE_KEYS } from '../../shared/constants/constants';
import { apiClient, setAccessToken } from '../../services/api';
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
      setAccessToken((response as any).token);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return { ...(response as any), user };
    }
    return response;
  },

  verifyMfa: async (challengeId: string, code: string) => {
    const data = await authApi.verifyMfa(challengeId, code);
    const { token, user, recoveryCodes } = data;
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) throw new Error('MFA returned an invalid user session.');
    setAccessToken(token);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    return { token, user: normalizedUser, recoveryCodes };
  },

  resendMfa: async (challengeId: string, mfaMethod?: string) => {
    return await authApi.resendMfa(challengeId, mfaMethod);
  },

  refreshSilent: async () => {
    const response = await apiClient.post('/v1/auth/refresh');
    if (response.data && response.data.success && response.data.data?.token) {
      const { token } = response.data.data;
      setAccessToken(token);
      return { token };
    }
    throw new Error('Failed to refresh session');
  },

  getGoogleLoginUrl: async () => {
    return await authApi.getGoogleLoginUrl();
  },

  getMicrosoftLoginUrl: async () => {
    return await authApi.getMicrosoftLoginUrl();
  },

  ssoCallback: async (code: string, state: string, provider: string) => {
    const data = await authApi.ssoCallback(code, state, provider);
    
    // Check if it requires MFA redirection challenge
    if (data.data && data.data.requiresMfa) {
      return data.data; // Return the MFA challenge instructions
    }

    const { token, user } = data.data;
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) throw new Error('SSO returned an invalid user session.');
    setAccessToken(token);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    return { token, user: normalizedUser };
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setAccessToken(null);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  getStoredSession: () => {
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (userData) {
      try {
        const user = normalizeUser(JSON.parse(userData));
        if (!user) return null;
        return {
          user
        };
      } catch {
        return null;
      }
    }
    return null;
  }
};
