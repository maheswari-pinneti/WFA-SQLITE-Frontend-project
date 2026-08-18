import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';

export class AuthorizationEngine {
  public static hasPermission(userRole: Role, userPermissions: Permission[], requiredPermission: Permission): boolean {
    if (userRole === Role.ADMIN) return true;
    return userPermissions.includes(requiredPermission);
  }

  public static hasAnyPermission(userRole: Role, userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    if (userRole === Role.ADMIN) return true;
    return requiredPermissions.some((p) => userPermissions.includes(p));
  }

  public static hasAllPermissions(userRole: Role, userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    if (userRole === Role.ADMIN) return true;
    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}
