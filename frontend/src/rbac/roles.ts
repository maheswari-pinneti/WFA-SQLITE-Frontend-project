export enum Role {
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  TEAM_LEAD = 'TEAM_LEAD',
  EMPLOYEE = 'EMPLOYEE',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'System Administrator',
  [Role.HR_MANAGER]: 'HR Manager',
  [Role.DEPARTMENT_HEAD]: 'Department Head',
  [Role.TEAM_LEAD]: 'Team Lead',
  [Role.EMPLOYEE]: 'Employee',
};
