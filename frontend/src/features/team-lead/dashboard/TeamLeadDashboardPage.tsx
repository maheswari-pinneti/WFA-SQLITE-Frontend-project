import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { Flame, GitPullRequest, Users, CheckCircle2, Zap, Clock, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamLeadDashboardOverview: React.FC = () => (
  <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-cyan-950/40 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center shrink-0">
        <GitPullRequest size={32} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Team Lead Operational Command</h2>
          <span className="badge badge-lead">FRONTEND SQUAD</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Direct reports tracking, sprint task velocity, daily attendance tracking & developer feedback.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Link to="/team-lead/tasks" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
        <Flame size={14} /> Sprint Tasks
      </Link>
      <Link to="/team-lead/members" className="btn btn-secondary btn-sm flex items-center gap-1.5">
        <Users size={14} /> Team Roster
      </Link>
    </div>
  </div>
);

export const TeamLeadDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  directReports: Employee[];
}> = (props) => (
  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-2 text-slate-300 text-xs font-extrabold uppercase">
      <Filter size={16} className="text-teal-400" /> Scoped Team Filters
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Employee</label>
        <select
          value={props.employeeFilter}
          onChange={(e) => props.setEmployeeFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold cursor-pointer"
        >
          <option value="All">All Team Members</option>
          {props.directReports.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const TeamLeadEmployeeTable: React.FC<{ filteredReports: Employee[] }> = ({ filteredReports }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Users size={18} className="text-teal-400" /> Team Employee Table
      </h3>
      <span className="text-xs text-slate-400 font-semibold bg-slate-950/60 px-3 py-1 rounded-full border border-slate-850">
        Showing {filteredReports.length} team members
      </span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4">Employee</th>
            <th className="py-3 px-4">Check In</th>
            <th className="py-3 px-4">Break</th>
            <th className="py-3 px-4">Resume</th>
            <th className="py-3 px-4">Check Out</th>
            <th className="py-3 px-4">Working Hours</th>
            <th className="py-3 px-4">Tasks Progress</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {filteredReports.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                <div>
                  <div>{emp.name}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{emp.designation || 'Developer'}</div>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-emerald-400">09:00 AM</td>
              <td className="py-3 px-4 font-mono text-slate-400">12:30 PM</td>
              <td className="py-3 px-4 font-mono text-slate-400">01:30 PM</td>
              <td className="py-3 px-4 font-mono text-rose-400">05:00 PM</td>
              <td className="py-3 px-4 font-mono font-bold text-blue-400">8.0 hrs</td>
              <td className="py-3 px-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {emp.status}
                </span>
              </td>
            </tr>
          ))}
          {filteredReports.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                No team members match the selected criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const TeamLeadSprintBoard: React.FC<{ sprintTasks: Task[] }> = ({ sprintTasks }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Layers size={18} className="text-rose-400" /> Team Sprint
      </h3>
      <span className="badge badge-success text-[10px] font-bold">FRONTEND SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4">Task</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {sprintTasks.slice(0, 6).map((task) => (
            <tr key={task.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 text-white font-medium max-w-[250px] truncate">{task.title}</td>
              <td className="py-3 px-4 text-slate-400">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300 font-bold uppercase">{task.status}</td>
              <td className="py-3 px-4 font-mono text-slate-400">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const TeamLeadDashboardPage: React.FC = () => {
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const teamName = 'Frontend';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getEmployees().catch(() => []),
      workforceApi.getTasks().catch(() => [])
    ]).then(([employees, tasks]) => {
      const allEmp = Array.isArray(employees) ? employees : employees.employees || [];
      setDirectReports(allEmp.filter((e: Employee) => e.team === teamName));
      setSprintTasks(tasks);
    }).catch((err) => {
      console.error('Error loading team lead data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Team Lead Scope',
      details,
    });
  };

  const filteredReports = directReports.filter(emp => {
    const matchesEmp = employeeFilter === 'All' || emp.id === employeeFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesEmp && matchesStatus;
  });

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]} requiredPermission={Permission.PRODUCTIVITY_VIEW}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <TeamLeadDashboardOverview />

        <TeamLeadDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          directReports={directReports}
        />

        {/* KPI metrics */}
        <div className="dashboard-kpi-grid">
          <KPICard
            title="Team Members"
            value={`${directReports.length} Developers`}
            change={0.0}
            trend="neutral"
            subtitle="Frontend Core Squad"
            icon={<Users size={20} />}
            accentColor="cyan"
            onClick={() => openDrillDown('Team Roster', `${directReports.length} Developers`, 'Active squad members', [
              { label: 'Frontend Developers', value: directReports.length }
            ])}
          />
          <KPICard title="Present" value={`${directReports.filter(e => e.status === 'Active').length} Present`} change={5.2} trend="up" subtitle="On duty today" icon={<CheckCircle2 size={20} />} accentColor="emerald" />
          <KPICard title="Absent" value="0 Absent" change={0.0} trend="neutral" subtitle="No unexcused absences" icon={<AlertTriangle size={20} />} accentColor="rose" />
          <KPICard title="Late" value="1 Late" change={-1.5} trend="down" subtitle="Clocked in after shift target" icon={<Clock size={20} />} accentColor="amber" />
          <KPICard title="On Leave" value="0 On Leave" change={0.0} trend="neutral" subtitle="Approved team PTO" icon={<Calendar size={20} />} accentColor="blue" />
          <KPICard title="Working Hours" value="45 hrs today" change={8.0} trend="up" subtitle="Total squad contribution" icon={<Clock size={20} />} accentColor="rose" />
          <KPICard title="Tasks Pending" value={`${sprintTasks.filter(t => t.status !== 'COMPLETED').length} Pending`} change={2.0} trend="up" subtitle="Sprint tasks in backlog" icon={<FileText size={20} />} accentColor="blue" />
          <KPICard title="Tasks Completed" value={`${sprintTasks.filter(t => t.status === 'COMPLETED').length} Closed`} change={100} trend="up" subtitle="Closed sprint targets" icon={<CheckCircle2 size={20} />} accentColor="emerald" />
        </div>

        {/* Primary Analytics Grid */}
        <div className="dashboard-chart-grid">
          <AnalyticsBarChart title="Squad Daily Attendance" subtitle="Weekdays breakdown inside squad" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#0ea5e9' }, { key: 'absent', name: 'Absent', color: '#f43f5e' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Squad Task Velocity" subtitle="Productivity by sprint task status" data={analytics.data?.teamProductivity} xKey="name" series={[{ key: 'productivity', name: 'Productivity Rate', color: '#10b981' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        {/* Secondary Analytics Grid */}
        <div className="dashboard-chart-grid !mt-4">
          <AnalyticsDonutChart title="Employment Status Mix" subtitle="Squad duty allocation" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsLineChart title="Squad Performance History" subtitle="Individual metrics trend" data={analytics.data?.performance} xKey="name" series={[{ key: 'performance', name: 'Performance', color: '#6366f1' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        <TeamLeadEmployeeTable filteredReports={filteredReports} />
        <TeamLeadSprintBoard sprintTasks={sprintTasks} />

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </RoleGuard>
  );
};
