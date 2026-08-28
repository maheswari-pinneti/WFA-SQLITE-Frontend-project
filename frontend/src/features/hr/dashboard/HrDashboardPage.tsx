import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { UserCheck, Users, Briefcase, FileText, Plus, Clock, HeartHandshake, Star, AlertTriangle, DollarSign, Filter, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HrDashboardOverview: React.FC<{ getGreeting: () => string; firstName: string }> = ({ getGreeting, firstName }) => (
  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
        <UserCheck size={32} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-white">{getGreeting()}, {firstName} 👋</h2>
          <span className="badge badge-hr">HR OPERATIONS PORTAL</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Workforce lifecycle, candidate recruitment, payroll analysis & employee attendance oversight.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Link to="/hr/employees" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
        <Plus size={14} /> Add Employee
      </Link>
      <Link to="/hr/recruitment" className="btn btn-secondary btn-sm flex items-center gap-1.5">
        <Briefcase size={14} /> Recruitment Desk
      </Link>
    </div>
  </div>
);

export const HrDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  empTypeFilter: string;
  setEmpTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = (props) => (
  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-2 text-slate-300 text-xs font-extrabold uppercase">
      <Filter size={16} className="text-purple-400" /> HR Operational Filters
    </div>
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Location</label>
        <select
          value={props.locationFilter}
          onChange={(e) => props.setLocationFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold cursor-pointer"
        >
          <option value="All">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Remote">Remote</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Department</label>
        <select
          value={props.deptFilter}
          onChange={(e) => props.setDeptFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold cursor-pointer"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Team</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Emp Type</label>
        <select
          value={props.empTypeFilter}
          onChange={(e) => props.setEmpTypeFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const HrSprintOverview: React.FC<{ hrTasks: Task[] }> = ({ hrTasks }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Layers size={18} className="text-purple-400" /> HR active Sprint work
      </h3>
      <span className="badge badge-primary text-[10px] font-bold">HR OPERATIONS SPRINT</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
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
          {hrTasks.map((task) => (
            <tr key={task.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 text-white font-medium max-w-[200px] truncate">{task.title}</td>
              <td className="py-3 px-4 text-slate-400">{task.assigneeName || 'HR Team'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300 font-bold uppercase">{task.status}</td>
              <td className="py-3 px-4 font-mono text-slate-400">2026-09-15</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const HrDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [hrTasks, setHrTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [empTypeFilter, setEmpTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    workforceApi.getTasks()
      .then(tasks => setHrTasks(tasks.slice(0, 5)))
      .catch(() => setHrTasks([]))
      .finally(() => setLoadingTasks(false));
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'HR Operations Lifecycle',
      details,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'HR';

  const rawCount = analytics?.metrics?.totalWorkforce ?? 254;
  const headCount = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 254;
  const attendanceRate = analytics?.metrics?.attendanceRate ?? '96.5%';
  const riskCount = analytics?.metrics?.retentionRiskCount ?? 0;
  const lateCount = analytics?.metrics?.lateArrivals ?? 0;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.EMPLOYEE_READ}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <HrDashboardOverview getGreeting={getGreeting} firstName={firstName} />
        <HrDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          empTypeFilter={empTypeFilter}
          setEmpTypeFilter={setEmpTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        
        {/* KPI metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Headcount"
            value={isLoading ? '…' : `${headCount} Staff`}
            change={8.4}
            trend="up"
            subtitle="Global workforce"
            icon={<Users size={20} />}
            accentColor="purple"
            onClick={() => openDrillDown('Total Headcount Breakdown', `${headCount} Staff`, 'Full workforce employment contracts', [
              { label: 'Authorized Workforce', value: headCount },
              { label: 'Primary Contracts', value: Math.max(0, headCount - 12) },
              { label: 'External Associates', value: Math.min(12, headCount) },
            ])}
          />
          <KPICard title="Active Employees" value={`${Math.round(headCount * 0.95)} Active`} change={4.2} trend="up" subtitle="Currently online/on-duty" icon={<UserCheck size={20} />} accentColor="blue" />
          <KPICard title="New Joiners" value="12 Joiners" change={1.2} trend="up" subtitle="This Calendar Month" icon={<Plus size={20} />} accentColor="emerald" />
          <KPICard title="Exits" value="2 Exits" change={-2.4} trend="down" subtitle="This Quarter" icon={<FileText size={20} />} accentColor="amber" />
          <KPICard title="On Leave" value="8 Staff" change={0} trend="neutral" subtitle="Approved PTO today" icon={<HeartHandshake size={20} />} accentColor="rose" />
          <KPICard title="Attendance Rate" value={attendanceRate} change={1.5} trend="up" subtitle="Weekly shift compliance" icon={<Clock size={20} />} accentColor="cyan" />
          <KPICard title="Pending Onboarding" value="5 Pending" change={0.4} trend="up" subtitle="Awaiting start date" icon={<Star size={20} />} accentColor="blue" />
          <KPICard title="Pending Documents" value="3 Audits" change={-0.8} trend="down" subtitle="Contract reviews" icon={<AlertTriangle size={20} />} accentColor="rose" />
        </div>

        <AnalyticsOverview title="HR Workforce Intelligence" subtitle="Organization-wide workforce lifecycle, attendance, skill coverage and retention analytics" />
        <EmployeeTable />
        <HrSprintOverview hrTasks={hrTasks} />

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </RoleGuard>
  );
};
