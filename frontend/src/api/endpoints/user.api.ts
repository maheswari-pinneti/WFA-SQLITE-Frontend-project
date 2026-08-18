import { apiClient } from '../../services/api';
import { User } from '../../auth/types/auth.types';

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/v1/users');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch users');
  },

  updateUserRole: async (userId: string, newRole: User['role']): Promise<User> => {
    const response = await apiClient.put(`/v1/users/${userId}/role`, { role: newRole });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to update user role');
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.delete(`/v1/users/${userId}`);
    if (response.data && response.data.success) {
      return true;
    }
    throw new Error(response.data?.message || 'Failed to delete user');
  }
};
