import { Role } from './roles';
import { Permission } from './permissions';

export interface UserContext {
  role: Role | string;
  permissions: (Permission | string)[];
  departmentAccess?: string[];
  locationAccess?: string[];
}

export const accessControl = {
  hasRole: (user: UserContext, allowedRoles: (Role | string)[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  },

  hasPermission: (user: UserContext, requiredPermission: Permission | string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
  },

  canAccessMenuItem: (user: UserContext, menuItem: { roles: string[]; permissions?: string[] }): boolean => {
    if (!user) return false;
    const roleMatch = menuItem.roles.includes(user.role);
    if (!roleMatch) return false;
    if (menuItem.permissions && menuItem.permissions.length > 0) {
      return menuItem.permissions.some((p) => user.permissions.includes(p));
    }
    return true;
  },
};
