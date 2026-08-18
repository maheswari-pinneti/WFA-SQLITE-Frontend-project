import { useAuth } from '../../auth/hooks/useAuth';
import { Permission } from '../../security/permissions/permissions';
import { Role } from '../../security/roles/roles';

export const usePermission = () => {
  const { role, permissions } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (role === Role.ADMIN) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permList: Permission[]): boolean => {
    if (role === Role.ADMIN) return true;
    return permList.some((p) => permissions.includes(p));
  };

  const authorize = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  const isRoleAllowed = (allowedRoles: Role[]): boolean => {
    return allowedRoles.includes(role);
  };

  const canAccess = (requiredPermission?: Permission, allowedRoles?: Role[]): boolean => {
    if (allowedRoles && !allowedRoles.includes(role)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  };

  return {
    hasPermission,
    hasAnyPermission,
    authorize,
    isRoleAllowed,
    canAccess,
    role,
    permissions,
  };
};
