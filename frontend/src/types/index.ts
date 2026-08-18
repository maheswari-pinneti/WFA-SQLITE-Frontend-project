import { Role } from '../security/roles/roles';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar?: string;
  phone?: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  employeeCount: number;
  budgetAllocated: number;
  location: string;
}

export interface LocationItem {
  id: string;
  name: string;
  country: string;
  city: string;
  timezone: string;
  employeeCount: number;
  status: 'OPERATIONAL' | 'EXPANDING' | 'MAINTENANCE';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export interface CandidateRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  applicantsCount: number;
  stage: 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED';
  priority: 'HIGH' | 'MEDIUM' | 'URGENT';
}

export interface EmployeeGoal {
  id: string;
  title: string;
  category: 'OKRs' | 'KPIs' | 'SKILLS';
  progress: number;
  targetDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK';
}

export interface EmployeePayslip {
  id: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  issuedDate: string;
  status: 'PAID' | 'PROCESSING';
}
