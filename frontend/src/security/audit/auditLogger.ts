import { Role } from '../roles/roles';
import { Permission } from '../permissions/permissions';

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'ACCESS_DENIED'
  | 'DATA_EXPORT'
  | 'VIEW_RESTRICTED_DATA'
  | 'UPDATE_EMPLOYEE'
  | 'SYSTEM_POLICY_UPDATE'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT';

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  userId: string;
  userRole: Role;
  action: AuditActionType | string;
  permissionRequired?: Permission;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details: string;
  ipAddress: string;
  resource?: string;
  department?: string;
}

class AuditLogger {
  private logs: AuditLogEvent[] = [
    {
      id: 'AUD-901',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'usr-101',
      userRole: Role.ADMIN,
      action: 'SYSTEM_POLICY_UPDATE',
      permissionRequired: Permission.SYSTEM_SETTINGS_MANAGE,
      status: 'SUCCESS',
      details: 'Updated global authentication policy and MFA enforced.',
      ipAddress: '192.168.1.1',
    },
    {
      id: 'AUD-902',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: 'usr-102',
      userRole: Role.HR,
      action: 'DATA_EXPORT',
      permissionRequired: Permission.REPORT_EXPORT,
      status: 'SUCCESS',
      details: 'Exported HR Department workforce records to CSV format.',
      ipAddress: '192.168.1.45',
      department: 'HR',
    },
    {
      id: 'AUD-903',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      userId: 'Manager01',
      userRole: Role.MANAGER,
      action: 'ACCESS_DENIED',
      permissionRequired: Permission.EMPLOYEE_READ,
      status: 'DENIED',
      details: 'Engineering Manager attempted to access Finance Department dataset.',
      ipAddress: '10.0.0.88',
      resource: 'Finance Department',
    },
  ];

  log(event: Omit<AuditLogEvent, 'id' | 'timestamp'>) {
    const logItem: AuditLogEvent = {
      ...event,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(logItem);
    console.log(`[DBAC AUDIT LOG] ${logItem.status}: ${logItem.action} by ${logItem.userId} (${logItem.userRole})`);
  }

  getLogs(): AuditLogEvent[] {
    return this.logs;
  }
}

export const auditLogger = new AuditLogger();
