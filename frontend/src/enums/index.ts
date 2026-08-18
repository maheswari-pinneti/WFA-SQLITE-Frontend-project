export enum EmploymentStatus {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  PROBATION = 'PROBATION',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum DepartmentType {
  HUMAN_RESOURCES = 'Human Resources',
  ENGINEERING = 'Engineering',
  FRONTEND = 'Engineering / Frontend',
  BACKEND = 'Engineering / Backend',
  QA = 'Engineering / QA',
  DEVOPS = 'Engineering / DevOps',
  FINANCE = 'Finance',
  SALES = 'Sales',
  MARKETING = 'Marketing',
  OPERATIONS = 'Operations',
  CUSTOMER_SUPPORT = 'Customer Support',
  ADMINISTRATION = 'Administration',
}
