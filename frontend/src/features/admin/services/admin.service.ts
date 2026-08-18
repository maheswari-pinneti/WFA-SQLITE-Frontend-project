import { userApi } from '../../../api/endpoints/user.api';
import { User } from '../../../auth/types/auth.types';

export const adminService = {
  fetchUsers: async (): Promise<User[]> => {
    return await userApi.getUsers();
  },

  updateRole: async (userId: string, role: User['role']): Promise<User> => {
    return await userApi.updateUserRole(userId, role);
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    return await userApi.deleteUser(userId);
  }
};
