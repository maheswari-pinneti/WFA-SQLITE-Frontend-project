import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';

export interface RoleSecurityPolicy {
  role: Role;
  hierarchyLevel: number;
  description: string;
  defaultPermissions: Permission[];
}

export const ROLE_SECURITY_POLICIES: Record<Role, RoleSecurityPolicy> = {
  [Role.ADMIN]: {
    role: Role.ADMIN,
    hierarchyLevel: 1,
    description: 'Full unrestricted system administration access',
    defaultPermissions: Object.values(Permission),
  },
  [Role.HR]: {
    role: Role.HR,
    hierarchyLevel: 2,
    description: 'Human Resources, recruitment, payroll, and employee records management',
    defaultPermissions: [
      Permission.EMPLOYEE_VIEW,
      Permission.EMPLOYEE_CREATE,
      Permission.EMPLOYEE_UPDATE,
      Permission.ATTENDANCE_VIEW,
      Permission.ATTENDANCE_MANAGE,
      Permission.LEAVE_APPROVE,
      Permission.PERFORMANCE_MANAGE,
      Permission.RECRUITMENT_MANAGE,
      Permission.REPORT_VIEW,
      Permission.REPORT_GENERATE,
      Permission.TEAM_ANALYTICS_VIEW,
    ],
  },
  [Role.MANAGER]: {
    role: Role.MANAGER,
    hierarchyLevel: 3,
    description: 'Departmental management, team analytics, approvals, and performance reviews',
    defaultPermissions: [
      Permission.TEAM_VIEW,
      Permission.TEAM_ANALYTICS_VIEW,
      Permission.EMPLOYEE_VIEW_TEAM,
      Permission.ATTENDANCE_VIEW_TEAM,
      Permission.PERFORMANCE_REVIEW,
      Permission.TASK_ASSIGN,
      Permission.REPORT_VIEW_TEAM,
      Permission.LEAVE_APPROVE,
    ],
  },
  [Role.TEAM_LEAD]: {
    role: Role.TEAM_LEAD,
    hierarchyLevel: 4,
    description: 'Operational team lead, task tracking, productivity insights, and peer feedback',
    defaultPermissions: [
      Permission.TEAM_MEMBER_VIEW,
      Permission.TASK_TRACK,
      Permission.PRODUCTIVITY_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.PERFORMANCE_FEEDBACK,
    ],
  },
  [Role.EMPLOYEE]: {
    role: Role.EMPLOYEE,
    hierarchyLevel: 5,
    description: 'Individual employee portal, attendance logging, leave requests, and goals',
    defaultPermissions: [
      Permission.PROFILE_VIEW,
      Permission.PROFILE_UPDATE,
      Permission.ATTENDANCE_VIEW_SELF,
      Permission.LEAVE_REQUEST,
      Permission.PERFORMANCE_VIEW_SELF,
      Permission.GOAL_UPDATE,
    ],
  },
};
