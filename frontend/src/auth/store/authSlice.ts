import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { Role } from '../../security/roles/roles';
import { apiClient } from '../../services/api';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const initializeAuthThunk = createAsyncThunk(
  'auth/initializeAuth',
  async () => {
    try {
      const refreshResult = await authService.refreshSilent();
      const token = refreshResult.token;
      
      const response = await apiClient.get('/v1/auth/me');
      if (response.data && response.data.success && response.data.data) {
        return {
          user: response.data.data,
          token
        };
      } else {
        await authService.logout();
        return { user: null, token: null };
      }
    } catch (err) {
      await authService.logout();
      return { user: null, token: null };
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password?: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await authService.logout();
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logoutAction: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    loginSuccessAction: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const payloadUser = action.payload?.user;
      if (!payloadUser) {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = 'The server returned an incomplete user session. Please sign in again.';
        return;
      }
      if (!Object.values(Role).includes(payloadUser.role)) {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = 'The server returned an invalid role. Please sign in again.';
        return;
      }
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = {
        ...payloadUser,
        permissions: Array.isArray(payloadUser.permissions) ? payloadUser.permissions : []
      };
      state.token = action.payload.token;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuthThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user && action.payload?.token) {
          state.isAuthenticated = true;
          state.user = {
            ...action.payload.user,
            permissions: Array.isArray(action.payload.user.permissions) ? action.payload.user.permissions : []
          };
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(initializeAuthThunk.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        if (payload && payload.requiresMfa) {
          state.isAuthenticated = false;
        } else if (!payload?.user || !Object.values(Role).includes(payload.user.role)) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error = 'The server returned an invalid user session. Please sign in again.';
        } else {
          state.isAuthenticated = true;
          state.user = payload?.user ? {
            ...payload.user,
            permissions: Array.isArray(payload.user.permissions) ? payload.user.permissions : []
          } : null;
          state.token = payload ? payload.token : null;
        }
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, logoutAction, loginSuccessAction } = authSlice.actions;
export default authSlice.reducer;
