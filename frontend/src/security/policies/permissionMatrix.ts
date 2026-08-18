import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';
import { ENTERPRISE_ROLE_PERMISSION_MAP, getRolePermissions } from './accessPolicies';

export const PERMISSION_MATRIX = ENTERPRISE_ROLE_PERMISSION_MAP;

export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  const allowedPermissions = getRolePermissions(userRole);
  if (allowedPermissions.includes(Permission.SYSTEM_ALL)) return true;
  return allowedPermissions.includes(permission);
};

export const hasRole = (userRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole);
};
