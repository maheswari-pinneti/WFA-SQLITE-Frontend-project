import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as attendanceController from '../controllers/attendance.controller.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as workforceController from '../controllers/workforce.controller.js';
import * as employeeController from '../controllers/employee.controller.js';
import * as organizationController from '../controllers/organization.controller.js';
import * as auditController from '../controllers/audit.controller.js';
import { authenticateToken, authorizeRoles, authorizePermissions, enforceScope } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/resilience.js';

const router = express.Router();

// Health Check
router.get('/health', authController.healthCheck);
router.get('/health/db', authController.healthCheckDb);

// Auth Routes
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/signup', authRateLimiter, authController.register);
router.post('/auth/register', authRateLimiter, authController.register);
router.post('/auth/mfa/verify', authRateLimiter, authController.verifyMfa);
router.post('/auth/mfa-verify', authRateLimiter, authController.verifyMfa);
router.post('/auth/mfa/resend', authRateLimiter, authController.resendMfa);
router.post('/auth/mfa-resend', authRateLimiter, authController.resendMfa);
router.post('/auth/logout', authenticateToken, authController.logout);
router.get('/auth/me', authenticateToken, authController.getMe);
router.post('/auth/refresh', authRateLimiter, authController.refresh);

// TOTP MFA Routes
router.get('/auth/mfa/totp/status', authenticateToken, authController.getMfaStatus);
router.post('/auth/mfa/totp/enroll', authenticateToken, authController.enrollTotpMfa);
router.post('/auth/mfa/totp/enroll/verify', authenticateToken, authController.confirmEnrollMfa);
router.post('/auth/mfa/totp/disable', authenticateToken, authController.disableTotpMfa);
router.post('/auth/mfa/totp/recovery-codes/regenerate', authenticateToken, authController.regenerateRecoveryCodes);

// Admin MFA Management
router.get('/admin/mfa/users', authenticateToken, authController.adminGetMfaUsers);
router.post('/admin/mfa/users/:userId/reset', authenticateToken, authController.adminResetMfa);

// Employees Directory
router.get('/employees', authenticateToken, enforceScope, employeeController.getEmployees);
router.put('/employees/:id/status', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_UPDATE', 'EMPLOYEE_MANAGE']), employeeController.updateEmployeeStatus);
router.get('/employees/:id', authenticateToken, enforceScope, employeeController.getEmployeeById);
router.post('/employees', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_CREATE', 'EMPLOYEE_MANAGE']), employeeController.createEmployee);
router.put('/employees/:id', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_UPDATE', 'EMPLOYEE_MANAGE']), employeeController.updateEmployee);
router.delete('/employees/:id', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_DELETE', 'EMPLOYEE_MANAGE']), employeeController.deleteEmployee);

// Team CRUD Route mappings
router.get('/teams', authenticateToken, employeeController.getTeams);
router.get('/teams/:id/members', authenticateToken, enforceScope, employeeController.getTeamMembers);

// Org, Dept & RBAC Route mappings
router.get('/departments', authenticateToken, organizationController.getDepartments);
router.get('/locations', authenticateToken, organizationController.getLocations);
router.get('/organizations', authenticateToken, organizationController.getOrganizations);
router.get('/roles', authenticateToken, organizationController.getRoles);
router.get('/permissions', authenticateToken, organizationController.getPermissions);

// Attendance Punch & Session Routes
router.get('/attendance/today', authenticateToken, attendanceController.getTodayAttendance);
router.post('/attendance/check-in', authenticateToken, enforceScope, attendanceController.checkIn);
router.post('/attendance/break', authenticateToken, enforceScope, attendanceController.takeBreak);
router.post('/attendance/resume', authenticateToken, enforceScope, attendanceController.resumeWork);
router.post('/attendance/check-out', authenticateToken, enforceScope, attendanceController.checkOut);
router.get('/attendance/records', authenticateToken, enforceScope, attendanceController.getRecords);
router.get('/attendance/shifts', authenticateToken, attendanceController.getShifts);
router.get('/attendance/audit-logs', authenticateToken, attendanceController.getAuditLogs);

// Persisted leave and task workflows
router.get('/leave-requests', authenticateToken, enforceScope, workforceController.getLeaveRequests);
router.post('/leave-requests', authenticateToken, enforceScope, workforceController.createLeaveRequest);
router.put('/leave-requests/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), workforceController.reviewLeaveRequest);
router.get('/tasks', authenticateToken, enforceScope, workforceController.getTasks);
router.put('/tasks/:id', authenticateToken, workforceController.updateTask);

// Corrections Requests
router.post('/attendance/corrections', authenticateToken, enforceScope, attendanceController.submitCorrection);
router.get('/attendance/corrections', authenticateToken, enforceScope, attendanceController.getCorrections);
router.put('/attendance/corrections/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), attendanceController.reviewCorrection);

// Analytics
router.get('/analytics', authenticateToken, enforceScope, analyticsController.getAnalytics);
router.get('/dashboard/metrics', authenticateToken, enforceScope, analyticsController.getAnalytics);

// Dashboard specific endpoints
router.get('/dashboard/summary', authenticateToken, enforceScope, analyticsController.getDashboardSummary);
router.get('/dashboard/workforce', authenticateToken, enforceScope, analyticsController.getWorkforceDistribution);
router.get('/dashboard/headcount', authenticateToken, enforceScope, analyticsController.getHeadcountAnalytics);
router.get('/dashboard/risk', authenticateToken, enforceScope, analyticsController.getRiskAnalytics);

// Analytics trends
router.get('/analytics/employee-growth', authenticateToken, enforceScope, analyticsController.getEmployeeGrowth);
router.get('/analytics/attendance-trend', authenticateToken, enforceScope, analyticsController.getAttendanceTrend);
router.get('/analytics/performance', authenticateToken, enforceScope, analyticsController.getPerformanceAnalytics);

// Audit Logs
router.get('/audit/logs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), auditController.getAuditLogs);
router.get('/audit/logs/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), auditController.getAuditLogDetail);

// User Management (Admin Only)
router.get('/users', authenticateToken, authorizeRoles(['ADMIN']), employeeController.getUsers);
router.put('/users/:userId/role', authenticateToken, authorizeRoles(['ADMIN']), employeeController.updateUserRole);
router.delete('/users/:userId', authenticateToken, authorizeRoles(['ADMIN']), employeeController.deleteUser);

export default router;
