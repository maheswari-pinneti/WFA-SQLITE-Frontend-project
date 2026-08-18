import { auditLogger } from '../security/audit/auditLogger';
import { Role } from '../security/roles/roles';

export interface DepartmentScopedItem {
  departmentId?: string;
  department?: string;
  [key: string]: any;
}

/**
 * Enterprise Frontend DBAC (Department-Based Access Control) Algorithm
 * 
 * Algorithm Steps:
 * 1. Validate user authentication context.
 * 2. Evaluate User Role Access Hierarchy:
 *    - ADMIN / HR: Unrestricted cross-department access (Returns full dataset).
 *    - MANAGER / TEAM LEAD: Restricted to user's assigned department ID/Name.
 *    - EMPLOYEE: Restricted to user's personal/team department context.
 * 3. Execute strict linear dataset filtering O(N) matching departmentId or department name.
 * 4. Audit Log security event if restricted department data is omitted.
 */
export const filterByDepartment = <T extends DepartmentScopedItem>(
  data: T[],
  user: any
): T[] => {
  if (!user || !Array.isArray(data)) return [];

  const roleStr = String(user.role || '').toLowerCase();

  // Step 1: Admin & HR have unrestricted global department access
  if (roleStr === 'admin' || roleStr === 'hr' || roleStr === 'hr_manager') {
    return data;
  }

  const userDeptId = String(user.departmentId || '').toUpperCase();
  const userDeptName = String(user.department || '').toLowerCase();

  // Step 2: Executive DBAC filtering algorithm
  const filtered = data.filter((item) => {
    if (!item) return false;
    const itemDeptId = String(item.departmentId || '').toUpperCase();
    const itemDeptName = String(item.department || '').toLowerCase();

    // Match by departmentId (e.g. HR001, ENG001, FIN001) or by department name (e.g. Engineering)
    const matchesId = Boolean(userDeptId && itemDeptId && userDeptId === itemDeptId);
    const matchesName = Boolean(userDeptName && itemDeptName && userDeptName === itemDeptName);

    return matchesId || matchesName;
  });

  // Step 3: Audit log DBAC filtering event
  const restrictedCount = data.length - filtered.length;
  if (restrictedCount > 0) {
    auditLogger.log({
      userId: user.id || user.email || 'USER',
      userRole: (user.role as Role) || Role.EMPLOYEE,
      action: 'VIEW_RESTRICTED_DATA',
      status: 'DENIED',
      details: `DBAC algorithm securely filtered ${restrictedCount} restricted department records for user ${user.email || user.name}`,
      ipAddress: '127.0.0.1'
    });
  }

  return filtered;
};
