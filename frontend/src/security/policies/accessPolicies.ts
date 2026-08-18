import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';
import { DataScope, DEFAULT_ROLE_SCOPES } from '../scopes/dataScope';

export const ENTERPRISE_ROLE_PERMISSION_MAP: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE,
    Permission.ROLE_CREATE,
    Permission.ROLE_UPDATE,
    Permission.ROLE_DELETE,
    Permission.ROLE_MANAGE,
    Permission.PERMISSION_ASSIGN,
    Permission.EMPLOYEE_VIEW_ALL,
    Permission.EMPLOYEE_CREATE,
    Permission.EMPLOYEE_UPDATE,
    Permission.EMPLOYEE_DELETE,
    Permission.REPORT_VIEW_ALL,
    Permission.REPORT_EXPORT,
    Permission.SYSTEM_SETTINGS_MANAGE,
    Permission.SYSTEM_CONFIG,
    Permission.AUDIT_LOG_VIEW,
    Permission.VIEW_ALL_DATA,
    Permission.EMPLOYEE_VIEW,
    Permission.ATTENDANCE_VIEW_ALL,
    Permission.LEAVE_APPROVE,
    Permission.TEAM_VIEW,
    Permission.PROFILE_VIEW,
  ],
  [Role.HR]: [
    Permission.EMPLOYEE_VIEW,
    Permission.EMPLOYEE_CREATE,
    Permission.EMPLOYEE_UPDATE,
    Permission.EMPLOYEE_PROFILE_MANAGE,
    Permission.ATTENDANCE_VIEW_ALL,
    Permission.ATTENDANCE_MANAGE,
    Permission.LEAVE_APPROVE,
    Permission.PERFORMANCE_MANAGE,
    Permission.RECRUITMENT_MANAGE,
    Permission.REPORT_GENERATE,
    Permission.EMPLOYEE_MANAGE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.PROFILE_VIEW,
  ],
  [Role.MANAGER]: [
    Permission.TEAM_VIEW,
    Permission.TEAM_ANALYTICS_VIEW,
    Permission.EMPLOYEE_VIEW_TEAM,
    Permission.ATTENDANCE_VIEW_TEAM,
    Permission.LEAVE_APPROVE,
    Permission.PERFORMANCE_REVIEW,
    Permission.TASK_ASSIGN,
    Permission.REPORT_VIEW_TEAM,
    Permission.PROFILE_VIEW,
  ],
  [Role.TEAM_LEAD]: [
    Permission.TEAM_MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_ASSIGN,
    Permission.TASK_TRACK,
    Permission.ATTENDANCE_VIEW_TEAM,
    Permission.PRODUCTIVITY_VIEW,
    Permission.FEEDBACK_CREATE,
    Permission.PERFORMANCE_FEEDBACK,
    Permission.PROFILE_VIEW,
  ],
  [Role.EMPLOYEE]: [
    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
    Permission.ATTENDANCE_VIEW_SELF,
    Permission.ATTENDANCE_VIEW,
    Permission.LEAVE_REQUEST,
    Permission.PERFORMANCE_VIEW_SELF,
    Permission.GOAL_UPDATE,
    Permission.DOCUMENT_UPLOAD,
  ],
};

export const PERMISSION_MATRIX = ENTERPRISE_ROLE_PERMISSION_MAP;

export const getRolePermissions = (role: Role): Permission[] => {
  return ENTERPRISE_ROLE_PERMISSION_MAP[role] || ENTERPRISE_ROLE_PERMISSION_MAP[Role.EMPLOYEE];
};

export const getRoleScope = (role: Role): DataScope => {
  return DEFAULT_ROLE_SCOPES[role] || DEFAULT_ROLE_SCOPES[Role.EMPLOYEE];
};
