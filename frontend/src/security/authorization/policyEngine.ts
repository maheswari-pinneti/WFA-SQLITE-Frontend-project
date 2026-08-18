import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';
import { ENTERPRISE_ROLE_PERMISSION_MAP } from '../policies/accessPolicies';
import { DataScope, DEFAULT_ROLE_SCOPES, ResourceTarget, UserABACAttributes, validateDataScope } from '../scopes/dataScope';

export interface AuthorizationContext {
  user: UserABACAttributes;
  scope?: DataScope;
  environment?: {
    timeOfDay?: string;
    ipAddress?: string;
    isMfaVerified?: boolean;
  };
}

export class PolicyEngine {
  /**
   * Evaluates if a user is authorized for a specific permission & target resource
   * evaluating RBAC -> PBAC -> ABAC -> Data Scope sequentially.
   */
  static authorize(
    context: AuthorizationContext,
    requiredPermission: Permission,
    targetResource?: ResourceTarget
  ): { allowed: boolean; reason?: string } {
    const { user, scope = DEFAULT_ROLE_SCOPES[user.role] } = context;

    // 1. RBAC / System Overrides
    if (user.role === Role.ADMIN) {
      return { allowed: true };
    }

    // 2. PBAC (Permission-Based Access Control) Check
    const rolePermissions = ENTERPRISE_ROLE_PERMISSION_MAP[user.role] || [];
    const hasPermissionFlag =
      rolePermissions.includes(Permission.VIEW_ALL_DATA) ||
      rolePermissions.includes(requiredPermission);

    if (!hasPermissionFlag) {
      return {
        allowed: false,
        reason: `Role '${user.role}' lacks explicit permission '${requiredPermission}'.`
      };
    }

    // 3. ABAC (Attribute-Based Access Control) Sensitivity Check
    if (targetResource?.sensitivityLevel !== undefined) {
      const userClearance = user.clearanceLevel ?? 10;
      if (userClearance < targetResource.sensitivityLevel) {
        return {
          allowed: false,
          reason: `Clearance level (${userClearance}) insufficient for resource sensitivity (${targetResource.sensitivityLevel}).`
        };
      }
    }

    // 4. Scope-Based Data Access Check
    if (targetResource) {
      const scopeAllowed = validateDataScope(user, targetResource);
      if (!scopeAllowed) {
        return {
          allowed: false,
          reason: `Target resource falls outside active user scope level '${scope}'.`
        };
      }
    }

    return { allowed: true };
  }
}
