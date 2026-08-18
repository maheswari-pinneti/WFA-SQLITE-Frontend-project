import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../auth/types/auth.types';
import { adminService } from '../services/admin.service';
import { Role } from '../../../security/roles/roles';

interface AdminState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  isLoading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk('admin/fetchUsers', async () => {
  return await adminService.fetchUsers();
});

export const updateUserRoleThunk = createAsyncThunk(
  'admin/updateRole',
  async ({ userId, role }: { userId: string; role: Role }) => {
    return await adminService.updateRole(userId, role);
  }
);

export const deleteUserThunk = createAsyncThunk('admin/deleteUser', async (userId: string) => {
  await adminService.deleteUser(userId);
  return userId;
});

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(updateUserRoleThunk.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
