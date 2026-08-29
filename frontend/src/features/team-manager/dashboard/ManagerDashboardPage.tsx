import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { Employee } from '../../../shared/types/common.types';
import { Briefcase, Users, CheckCircle2, XCircle, Clock, Zap, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboardOverview: React.FC = () => (
  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
        <Briefcase size={32} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Department Manager Workspace</h2>
          <span className="badge badge-manager">ENGINEERING SCOPE</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Resource allocation, sub-team sprint velocity, leave approvals & department throughput.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Link to="/manager/approvals" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
        <CheckCircle2 size={14} /> Leave Approvals
      </Link>
      <Link to="/manager/analytics" className="btn btn-secondary btn-sm flex items-center gap-1.5">
        <Zap size={14} /> Team Analytics
      </Link>
    </div>
  </div>
);

export const ManagerDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  employees: Employee[];
  departmentName: string;
}> = (props) => (
  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-2 text-slate-300 text-xs font-extrabold uppercase">
      <Filter size={16} className="text-blue-400" /> Scoped Department Filters
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Team</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="QA">QA</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Employee</label>
        <select
          value={props.employeeFilter}
          onChange={(e) => props.setEmployeeFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Department Employees</option>
          {props.employees.filter(e => e.department === props.departmentName).map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const ManagerEmployeeTable: React.FC<{ deptEmployees: Employee[] }> = ({ deptEmployees }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Users size={18} className="text-emerald-500" /> Department Employee Table
      </h3>
      <span className="text-xs text-slate-400 font-semibold bg-slate-950/60 px-3 py-1 rounded-full border border-slate-850">
        Showing {deptEmployees.length} department staff
      </span>
    </div>
    <div className="overflow-auto max-h-[500px] rounded-xl border border-slate-800 bg-slate-950/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4">Employee</th>
            <th className="py-3 px-4">Team</th>
            <th className="py-3 px-4">Designation</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Check In</th>
            <th className="py-3 px-4">Check Out</th>
            <th className="py-3 px-4">Working Hours</th>
            <th className="py-3 px-4">Attendance</th>
            <th className="py-3 px-4">Performance</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {deptEmployees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-white">
                <div>{emp.name}</div>
              </td>
              <td className="py-3 px-4 text-slate-300">{emp.team || 'N/A'}</td>
              <td className="py-3 px-4 text-slate-400">{emp.designation || 'Engineer'}</td>
              <td className="py-3 px-4 text-slate-450">{emp.location || 'HQ'}</td>
              <td className="py-3 px-4 font-mono text-emerald-400">09:05 AM</td>
              <td className="py-3 px-4 font-mono text-rose-400">05:15 PM</td>
              <td className="py-3 px-4 font-mono text-blue-400">8.17 hrs</td>
              <td className="py-3 px-4 font-bold text-emerald-400">{(emp.attendanceRate || 96.0).toFixed(1)}%</td>
              <td className="py-3 px-4 font-bold text-indigo-400">{(emp.performanceScore || 85.0).toFixed(0)}%</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {emp.status}
                </span>
              </td>
            </tr>
          ))}
          {deptEmployees.length === 0 && (
            <tr>
              <td colSpan={10} className="py-8 text-center text-slate-500 font-semibold">
                No department staff match the selected criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const ManagerSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Layers size={18} className="text-blue-500" /> Department Sprint
      </h3>
      <span className="badge badge-success text-[10px] font-bold">ENGINEERING SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4">Sprint</th>
            <th className="py-3 px-4">Task</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Progress</th>
            <th className="py-3 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {tasks.slice(0, 5).map((task) => (
            <tr key={task.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-slate-300">Sprint 24B</td>
              <td className="py-3 px-4 text-white font-medium max-w-[200px] truncate">{task.title}</td>
              <td className="py-3 px-4 text-slate-400">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300 font-bold uppercase">{task.status}</td>
              <td className="py-3 px-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%' }}></div>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-slate-400">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ManagerDashboardPage: React.FC = () => {
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [approvals, setApprovals] = useState<Array<{ id: string; employee: string; type: string; duration: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadApprovals = async () => {
    const requests = await workforceApi.getLeaveRequests();
    setApprovals(requests.map((request) => ({
      id: request.id,
      employee: request.employeeName,
      type: request.type,
      duration: `${request.startDate} - ${request.endDate}`,
      reason: request.reason,
      status: request.status
    })));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empData, taskData] = await Promise.all([
          employeeApi.getEmployees().catch(() => []),
          workforceApi.getTasks().catch(() => [])
        ]);
        setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
        setTasks(taskData);
        await loadApprovals().catch(() => setApprovals([]));
      } catch (err) {
        console.error('Error fetching manager dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await workforceApi.reviewLeaveRequest(id, status);
      await loadApprovals();
    } catch {
      // Fallback
    }
  };

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Department Manager Scope',
      details,
    });
  };

  const departmentName = 'Engineering';

  const deptEmployees = employees.filter(emp => {
    const isDept = emp.department === departmentName;
    const matchesTeam = teamFilter === 'All' || emp.team === teamFilter;
    const matchesEmp = employeeFilter === 'All' || emp.id === employeeFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return isDept && matchesTeam && matchesEmp && matchesStatus;
  });

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]} requiredPermission={Permission.TEAM_ANALYTICS_VIEW}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <ManagerDashboardOverview />

        <ManagerDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          employees={employees}
          departmentName={departmentName}
        />

        {/* KPI metrics */}
        <div className="dashboard-kpi-grid">
          <KPICard
            title="Department Staff"
            value={`${employees.filter(e => e.department === departmentName).length} Engineers`}
            change={8.3}
            trend="up"
            subtitle="Authorized department rosters"
            icon={<Users size={20} />}
            accentColor="blue"
            onClick={() => openDrillDown('Department Roster Breakdown', 'Engineers', 'Active engineering staff', [
              { label: 'Engineering Total', value: employees.filter(e => e.department === departmentName).length }
            ])}
          />
          <KPICard title="Active Employees" value="18 Online" change={0.0} trend="neutral" subtitle="Clocked in today" icon={<Users size={20} />} accentColor="cyan" />
          <KPICard title="Present Today" value="16 Staff" change={2.0} trend="up" subtitle="Office presence" icon={<CheckCircle2 size={20} />} accentColor="emerald" />
          <KPICard title="Absent Today" value="2 Staff" change={0} trend="neutral" subtitle="Unexcused absence" icon={<XCircle size={20} />} accentColor="rose" />
          <KPICard title="Late Today" value="3 Staff" change={1.0} trend="up" subtitle="Clocked in after 9:15" icon={<Clock size={20} />} accentColor="amber" />
          <KPICard title="On Leave" value="1 Staff" change={-1.0} trend="down" subtitle="Approved PTO today" icon={<AlertTriangle size={20} />} accentColor="blue" />
          <KPICard title="Attendance %" value="98.2%" change={1.2} trend="up" subtitle="Active shift rate" icon={<Star size={20} />} accentColor="cyan" />
          <KPICard title="Pending Approvals" value={`${pendingApprovalsCount} Requests`} change={0.0} trend="neutral" subtitle="Requires manager action" icon={<FileText size={20} />} accentColor="rose" />
        </div>

        {/* Primary Analytics Grid */}
        <div className="dashboard-chart-grid">
          <AnalyticsLineChart title="Department Growth & Hiring" subtitle="Staff additions inside department" data={analytics.data?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#3b82f6' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Team Attendance Overview" subtitle="Attendance metrics by team" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        {/* Secondary Analytics Grid */}
        <div className="dashboard-chart-grid !mt-4">
          <AnalyticsDonutChart title="Employment Status Mix" subtitle="Department active duty rate" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Department Distribution" subtitle="Staff distribution in department" data={analytics.data?.departmentDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Productivity & Performance" subtitle="Team productivity score index" data={analytics.data?.teamProductivity} xKey="name" series={[{ key: 'productivity', name: 'Productivity', color: '#8b5cf6' }]} layout="vertical" isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Retention Risks" subtitle="Retention risk distribution" data={analytics.data?.riskDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} colors={['#ef4444', '#f59e0b', '#10b981']} />
        </div>

        <ManagerEmployeeTable deptEmployees={deptEmployees} />
        <ManagerSprintOverview tasks={tasks} />

        {/* Leave Requests Approvals Desk */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock size={18} className="text-amber-400" /> Pending Team Leave & Request Approvals Desk
            </h3>
            <Link to="/manager/approvals" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
              Approvals Desk <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvals.length === 0 ? <p className="text-sm text-[var(--text-muted)] md:col-span-3">No leave requests are waiting in your department.</p> : approvals.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{req.employee}</span>
                  <span className="badge badge-info text-[9px] uppercase font-bold">{req.type}</span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-blue-400">{req.duration}</span> — {req.reason}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => void handleAction(req.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => void handleAction(req.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'} text-xs font-bold uppercase`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </RoleGuard>
  );
};
