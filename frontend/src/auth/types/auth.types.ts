import { Role } from '../../security/roles/roles';
import { Permission } from '../../security/permissions/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department: string;
  departmentId?: string;
  teamId?: string;
  team?: string;
  location?: string;
  title: string;
  clearanceLevel?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: Permission[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}
