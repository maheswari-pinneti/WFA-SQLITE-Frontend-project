import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../security/guards/ProtectedRoute';
import { RoleGuard } from '../../security/guards/RoleGuard';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { LoginPage } from '../../auth/pages/LoginPage';
import { SignUpPage } from '../../auth/pages/SignUpPage';
import { LogoutPage } from '../../auth/pages/LogoutPage';
import { SsoCallbackPage } from '../../auth/pages/SsoCallbackPage';
import { Role, ROLE_HOME_PATHS } from '../../security/roles/roles';
import { useAuth } from '../../auth/hooks/useAuth';

// Admin Dashboards & Pages
import { AdminDashboardPage as AdminDashboard } from '../../features/admin/dashboard/AdminDashboardPage';
import { UserManagement } from '../../features/admin/pages/UserManagement';
import { RoleManagement } from '../../features/admin/pages/RoleManagement';
import { PermissionsManagement } from '../../features/admin/pages/PermissionsManagement';
import { DepartmentsManagement } from '../../features/admin/pages/DepartmentsManagement';
import { LocationsManagement } from '../../features/admin/pages/LocationsManagement';
import { AuditLogsPage } from '../../features/admin/pages/AuditLogsPage';
import { SystemSettings } from '../../features/admin/pages/SystemSettings';
import { SystemConfiguration } from '../../features/admin/pages/SystemConfiguration';
import { SecurityAdminDashboard } from '../../features/admin/pages/SecurityAdminDashboard';

// HR Dashboards & Pages
import { HrDashboardPage as HRDashboard } from '../../features/hr/dashboard/HrDashboardPage';
import { EmployeeManagement } from '../../features/hr/pages/EmployeeManagement';
import { AttendanceManagement } from '../../features/hr/pages/AttendanceManagement';
import { RecruitmentManagement } from '../../features/hr/pages/RecruitmentManagement';
import { LeaveManagement } from '../../features/hr/pages/LeaveManagement';
import { PayrollReports } from '../../features/hr/pages/PayrollReports';
import { HRReports } from '../../features/hr/pages/HRReports';

// Manager Dashboards & Pages
import { ManagerDashboardPage as ManagerDashboard } from '../../features/team-manager/dashboard/ManagerDashboardPage';
import { TeamAnalytics } from '../../features/team-manager/pages/TeamAnalytics';
import { TeamReports } from '../../features/team-manager/pages/TeamReports';
import { ApprovalsPage } from '../../features/team-manager/pages/ApprovalsPage';
import { DeptHeadDashboard } from '../../features/team-manager/pages/DeptHeadDashboard';

// Team Lead Dashboards & Pages
import { TeamLeadDashboardPage as TeamLeadDashboard } from '../../features/team-lead/dashboard/TeamLeadDashboardPage';
import { TeamMembersPage } from '../../features/team-lead/pages/TeamMembersPage';
import { TaskTrackingPage } from '../../features/team-lead/pages/TaskTrackingPage';
import { Productivity } from '../../features/team-lead/pages/Productivity';
import { FeedbackManagement } from '../../features/team-lead/pages/FeedbackManagement';

// Employee Dashboards & Pages
import { EmployeeDashboardPage as EmployeeDashboard } from '../../features/employee/dashboard/EmployeeDashboardPage';
import { Profile } from '../../features/employee/pages/Profile';
import { MyAttendance } from '../../features/employee/pages/MyAttendance';
import { MyPerformance } from '../../features/employee/pages/MyPerformance';
import { EmployeeRequestsPage } from '../../features/employee/pages/EmployeeRequestsPage';
import { MyGoalsPage } from '../../features/employee/pages/MyGoalsPage';
import { PayslipsPage } from '../../features/employee/pages/PayslipsPage';

// Error Pages
import { NotFoundPage, AccessDeniedPage, ServerErrorPage } from '../../features/error';
import { Unauthorized } from '../../pages/Unauthorized';

// Newly Created Dashboard Subpage Components
import { ProductivityAnalyticsPage } from '../../features/analytics/pages/ProductivityAnalyticsPage';
import { RiskAnalyticsPage } from '../../features/analytics/pages/RiskAnalyticsPage';
import { SkillsAnalyticsPage } from '../../features/analytics/pages/SkillsAnalyticsPage';
import { PerformanceAnalyticsPage } from '../../features/analytics/pages/PerformanceAnalyticsPage';
import { PerformanceOverviewPage } from '../../features/analytics/pages/PerformanceOverviewPage';
import { OrgOverviewPage } from '../../features/admin/pages/OrgOverviewPage';
import { TeamsPage } from '../../features/admin/pages/TeamsPage';
import { OrganizationPage } from '../../features/admin/pages/OrganizationPage';
import { AccessControlPage } from '../../features/admin/pages/AccessControlPage';
import { GeofencingPage } from '../../features/admin/pages/GeofencingPage';
import { AttendanceHistoryPage } from '../../features/hr/pages/AttendanceHistoryPage';
import { ShiftsPage } from '../../features/hr/pages/ShiftsPage';
import { AttendanceCorrectionsPage } from '../../features/hr/pages/AttendanceCorrectionsPage';
import { SkillOverviewPage } from '../../features/analytics/pages/SkillOverviewPage';
import { SkillGapsPage } from '../../features/analytics/pages/SkillGapsPage';
import { SkillCoveragePage } from '../../features/analytics/pages/SkillCoveragePage';

const DefaultHomeRedirect: React.FC = () => {
  const { role } = useAuth();
  const target = ROLE_HOME_PATHS[role] || '/employee/dashboard';
  return <Navigate to={target} replace />;
};

export const AppRoutes: React.FC = () => {
  const { initializeAuth, isLoading } = useAuth();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)] gap-3 font-sans">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm tracking-wide">Initializing secure workspace...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/verify-email" element={<LoginPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Protected Routes Enclosed in Enterprise MainLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                {/* ==================== 1. ADMIN ROUTES ==================== */}
                <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AdminDashboard /></RoleGuard>} />
                <Route path="/admin/users" element={<RoleGuard allowedRoles={[Role.ADMIN]}><UserManagement /></RoleGuard>} />
                <Route path="/admin/roles" element={<RoleGuard allowedRoles={[Role.ADMIN]}><RoleManagement /></RoleGuard>} />
                <Route path="/admin/permissions" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PermissionsManagement /></RoleGuard>} />
                <Route path="/admin/employees" element={<RoleGuard allowedRoles={[Role.ADMIN]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/admin/departments" element={<RoleGuard allowedRoles={[Role.ADMIN]}><DepartmentsManagement /></RoleGuard>} />
                <Route path="/admin/locations" element={<RoleGuard allowedRoles={[Role.ADMIN]}><LocationsManagement /></RoleGuard>} />
                <Route path="/admin/analytics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/admin/reports" element={<RoleGuard allowedRoles={[Role.ADMIN]}><HRReports /></RoleGuard>} />
                <Route path="/admin/audit-logs" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AuditLogsPage /></RoleGuard>} />
                <Route path="/admin/settings" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemSettings /></RoleGuard>} />
                <Route path="/admin/configuration" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemConfiguration /></RoleGuard>} />
                
                {/* Admin Analytics & Subsections */}
                <Route path="/admin/skills-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/admin/skills-gaps" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/admin/skills-coverage" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/admin/performance-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/admin/productivity-metrics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/access-control" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AccessControlPage /></RoleGuard>} />
                <Route path="/admin/geofencing" element={<RoleGuard allowedRoles={[Role.ADMIN]}><GeofencingPage /></RoleGuard>} />
                
                {/* Additional Admin Roster & Oversight Pages */}
                <Route path="/admin/productivity" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/risk" element={<RoleGuard allowedRoles={[Role.ADMIN]}><RiskAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/skills-analytics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillsAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/teams" element={<RoleGuard allowedRoles={[Role.ADMIN]}><TeamsPage /></RoleGuard>} />
                <Route path="/admin/organization" element={<RoleGuard allowedRoles={[Role.ADMIN]}><OrganizationPage /></RoleGuard>} />
                <Route path="/admin/attendance-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><OrgOverviewPage /></RoleGuard>} />
                <Route path="/admin/attendance-history" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/admin/shifts" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/admin/corrections" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/admin/approvals" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />

                {/* ==================== 2. HR ROUTES ==================== */}
                <Route path="/hr/dashboard" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HRDashboard /></RoleGuard>} />
                <Route path="/hr/employees" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/hr/recruitment" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/hr/attendance" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/hr/leave" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><LeaveManagement /></RoleGuard>} />
                <Route path="/hr/performance" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PerformanceAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/payroll-reports" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PayrollReports /></RoleGuard>} />
                <Route path="/hr/workforce-analytics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/hr/reports" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HRReports /></RoleGuard>} />
                <Route path="/hr/departments" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><DepartmentsManagement /></RoleGuard>} />

                {/* HR Analytics & Attendance Subsections */}
                <Route path="/hr/productivity" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/productivity-metrics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/skills-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/hr/skills-gaps" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/hr/skills-coverage" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/hr/risk" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><RiskAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/teams" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><TeamsPage /></RoleGuard>} />
                <Route path="/hr/attendance-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><OrgOverviewPage /></RoleGuard>} />
                <Route path="/hr/attendance-history" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/hr/shifts" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/hr/corrections" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/hr/approvals" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/hr/performance-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/hr/recruitment-analytics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/hr/workforce-planning" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/hr/audit-logs" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AuditLogsPage /></RoleGuard>} />
                <Route path="/hr/settings" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SystemSettings /></RoleGuard>} />

                {/* ==================== 3. DEPARTMENT MANAGER ROUTES ==================== */}
                <Route path="/manager/dashboard" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerDashboard /></RoleGuard>} />
                <Route path="/manager/team" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><DeptHeadDashboard /></RoleGuard>} />
                <Route path="/manager/analytics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/manager/attendance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/leave-requests" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/manager/approvals" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/manager/performance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/reports" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/productivity" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><Productivity /></RoleGuard>} />
                <Route path="/manager/attendance-analytics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/skills-gaps" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/manager/team-members" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/manager/team-overview" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><DeptHeadDashboard /></RoleGuard>} />
                <Route path="/manager/team-attendance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/attendance-history" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/manager/corrections" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/manager/team-skills" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><DeptHeadDashboard /></RoleGuard>} />
                <Route path="/manager/skills-gaps-view" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/manager/skills-coverage" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/manager/team-performance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/productivity-metrics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/manager/shifts" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/settings" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* ==================== 4. TEAM LEAD ROUTES (SPEC SECTION 16) ==================== */}
                <Route path="/team/dashboard" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamLeadDashboard /></RoleGuard>} />
                <Route path="/team/members" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team/attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/team/goals" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TaskTrackingPage /></RoleGuard>} />
                <Route path="/team/analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Productivity /></RoleGuard>} />

                <Route path="/team-lead/dashboard" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamLeadDashboard /></RoleGuard>} />
                <Route path="/team-lead/tasks" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TaskTrackingPage /></RoleGuard>} />
                <Route path="/team-lead/attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/team-lead/productivity" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Productivity /></RoleGuard>} />
                <Route path="/team-lead/performance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team-lead/feedback" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><FeedbackManagement /></RoleGuard>} />
                <Route path="/team-lead/attendance-analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/team-lead/workforce-analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/team-lead/team-members" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team-lead/team-overview" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><OrgOverviewPage /></RoleGuard>} />
                <Route path="/team-lead/team-attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/team-lead/attendance-history" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/team-lead/corrections" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/team-lead/approvals" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/team-lead/team-skills" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team-lead/skills-gaps" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/team-lead/team-performance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/team-lead/shifts" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/team-lead/reports" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/team-lead/settings" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* ==================== 5. EMPLOYEE ROUTES (SPEC SECTION 16) ==================== */}
                <Route path="/me/dashboard" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/me/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/me/attendance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/me/leave" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/me/performance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyPerformance /></RoleGuard>} />
                <Route path="/me/notifications" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />

                <Route path="/employee/dashboard" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/employee/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/attendance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/attendance-today" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/check-in-out" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/break" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/working-hours" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/shifts" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/employee/skills" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/employee/skills-coverage" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/employee/skills-gaps" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/employee/leave" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/employee/performance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyPerformance /></RoleGuard>} />
                <Route path="/employee/goals" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><MyGoalsPage /></RoleGuard>} />
                <Route path="/employee/payslips" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><PayslipsPage /></RoleGuard>} />
                <Route path="/employee/corrections" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/employee/settings" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* Dedicated Error Pages Routes */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/403" element={<AccessDeniedPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Legacy Root Paths Redirects */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
                <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
                <Route path="/team-lead" element={<Navigate to="/team-lead/dashboard" replace />} />
                <Route path="/team" element={<Navigate to="/team/dashboard" replace />} />
                <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
                <Route path="/me" element={<Navigate to="/me/dashboard" replace />} />

                {/* Default Route Fallback */}
                <Route path="/" element={<DefaultHomeRedirect />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
