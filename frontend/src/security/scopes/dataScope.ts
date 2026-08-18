import { Role } from '../roles/roles';

export type DataScope = 'ALL' | 'DEPARTMENT' | 'TEAM' | 'SELF';

export interface DataScopeFilter {
  scopeType: DataScope;
  departmentId?: string;
  teamId?: string;
  userId?: string;
  level?: number;
}

export interface ResourceTarget {
  id: string;
  departmentId?: string;
  teamId?: string;
  ownerId?: string;
  sensitivityLevel?: number;
}

export interface UserABACAttributes {
  userId: string;
  role: Role;
  departmentId?: string;
  teamId?: string;
  clearanceLevel?: number;
}

export const DEFAULT_ROLE_SCOPES: Record<Role, DataScope> = {
  [Role.ADMIN]: 'ALL',
  [Role.HR]: 'ALL',
  [Role.MANAGER]: 'DEPARTMENT',
  [Role.TEAM_LEAD]: 'TEAM',
  [Role.EMPLOYEE]: 'SELF',
};

/**
 * Department-Based Access Control (DBAC) Validation
 * Evaluates whether a user has permission to access resources in a target department.
 */
export function validateDepartmentAccess(userDeptId: string | undefined, targetDeptId: string | undefined, userRole: Role): boolean {
  if (userRole === Role.ADMIN || userRole === Role.HR) return true;
  if (!userDeptId || !targetDeptId) return false;
  if (userDeptId === targetDeptId) return true;
  
  // Parent Department Inheritance (e.g., 'Engineering' access to 'Engineering / Frontend')
  if (targetDeptId.startsWith(userDeptId) || userDeptId.startsWith(targetDeptId)) {
    return true;
  }
  return false;
}

export function validateDataScope(user: UserABACAttributes, resource: ResourceTarget): boolean {
  if (user.role === Role.ADMIN || user.role === Role.HR) return true;
  if (user.role === Role.MANAGER && user.departmentId) {
    return validateDepartmentAccess(user.departmentId, resource.departmentId, user.role);
  }
  if (user.role === Role.TEAM_LEAD && user.teamId && user.teamId === resource.teamId) return true;
  if (user.userId === resource.ownerId) return true;
  return false;
}

export class DataScopeEvaluator {
  public static getScopeForUser(role: Role, userDeptId?: string, userTeamId?: string, userId?: string): DataScopeFilter {
    switch (role) {
      case Role.ADMIN:
      case Role.HR:
        return { scopeType: 'ALL', level: 1 };
      case Role.MANAGER:
        return { scopeType: 'DEPARTMENT', departmentId: userDeptId, level: 2 };
      case Role.TEAM_LEAD:
        return { scopeType: 'TEAM', teamId: userTeamId, level: 3 };
      case Role.EMPLOYEE:
      default:
        return { scopeType: 'SELF', userId, level: 4 };
    }
  }

  public static canAccessDepartment(role: Role, userDept: string | undefined, targetDept: string): boolean {
    return validateDepartmentAccess(userDept, targetDept, role);
  }
}
