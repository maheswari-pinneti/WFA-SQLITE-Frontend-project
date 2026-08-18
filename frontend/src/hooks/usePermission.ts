import { useAuth } from '../auth/hooks/useAuth';
import { Permission } from '../security/permissions/permissions';

export const usePermission = () => {
  const { permissions, role } = useAuth();

  const hasPermission = (requiredPermission: Permission | string): boolean => {
    if (!permissions) return false;
    return permissions.includes(requiredPermission as Permission);
  };

  const hasAnyPermission = (requiredPermissions: (Permission | string)[]): boolean => {
    if (!permissions) return false;
    return requiredPermissions.some((p) => permissions.includes(p as Permission));
  };

  const hasAllPermissions = (requiredPermissions: (Permission | string)[]): boolean => {
    if (!permissions) return false;
    return requiredPermissions.every((p) => permissions.includes(p as Permission));
  };

  return {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
