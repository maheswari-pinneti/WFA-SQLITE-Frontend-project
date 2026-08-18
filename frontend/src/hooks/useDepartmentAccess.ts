import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { auditLogger } from "../security/audit/auditLogger";
import { Role } from "../security/roles/roles";

/**
 * Enterprise DBAC Permission Verification Hook
 * 
 * Algorithm:
 * 1. Read current user identity and assigned role/departmentId from Redux auth slice.
 * 2. Evaluate access permissions:
 *    - Role is ADMIN / HR -> Grants TRUE for all department queries.
 *    - Role is MANAGER / TEAM LEAD / EMPLOYEE -> Grants TRUE ONLY if target department matches user.departmentId.
 * 3. Log security denial event if an unauthorized access evaluation returns FALSE.
 */
export const useDepartmentAccess = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasDepartmentAccess = (departmentId: string): boolean => {
    if (!user) return false;

    const roleStr = String(user.role || '').toLowerCase();

    // Admin & HR have global cross-department access
    if (roleStr === "admin" || roleStr === "hr" || roleStr === "hr_manager") {
      return true;
    }

    const targetId = String(departmentId || '').toUpperCase();
    const userDeptId = String(user.departmentId || '').toUpperCase();
    const userDeptName = String(user.department || '').toLowerCase();
    const targetName = String(departmentId || '').toLowerCase();

    const isGranted = Boolean(
      (userDeptId && targetId && userDeptId === targetId) ||
      (userDeptName && targetName && userDeptName === targetName)
    );

    if (!isGranted) {
      auditLogger.log({
        userId: user.id || user.email || 'USER',
        userRole: (user.role as Role) || Role.EMPLOYEE,
        action: 'ACCESS_DENIED',
        status: 'DENIED',
        details: `Unauthorized department access attempt by ${user.email} (${user.role}) for department [${departmentId}]`,
        ipAddress: '127.0.0.1'
      });
    }

    return isGranted;
  };

  const canAccessDepartment = (departmentIdOrName: string): boolean => {
    return hasDepartmentAccess(departmentIdOrName);
  };

  return {
    user,
    hasDepartmentAccess,
    canAccessDepartment,
    userDepartment: user?.department || "HR",
    userDepartmentId: user?.departmentId || "HR001",
  };
};
