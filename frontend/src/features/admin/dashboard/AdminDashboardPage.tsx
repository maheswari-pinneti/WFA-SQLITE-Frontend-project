import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import {
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Award,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Briefcase,
  ShieldCheck,
  Layers,
  Filter,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardOverview: React.FC<{
  currentDateFormatted: string;
  getGreeting: () => string;
  firstName: string;
  user: any;
}> = ({ currentDateFormatted, getGreeting, firstName, user }) => (
  <div className="dashboard-hero p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 text-white border border-blue-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
    <div className="space-y-2 z-10">
      <div style={{ display: 'inline-flex', width: 'fit-content' }} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-md border border-white/20">
        <Calendar size={14} className="text-blue-300" /> {currentDateFormatted}
      </div>
      <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
        {getGreeting()}, {firstName} 👋
      </h2>
      <p className="text-xs text-blue-100 font-medium">
        Department: <span className="font-bold text-white">{user?.department || 'Executive Governance'}</span> • Role: <span className="font-bold text-amber-300">System Administrator</span>
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2.5 z-10">
      <Link to="/admin/employees" className="btn btn-primary btn-sm flex items-center gap-2">
        <UserPlus size={16} /> Add Employee
      </Link>
      <Link to="/admin/attendance-overview" className="btn btn-secondary btn-sm flex items-center gap-2">
        <Clock size={16} /> View Attendance
      </Link>
      <Link to="/admin/reports" className="btn btn-secondary btn-sm flex items-center gap-2">
        <FileSpreadsheet size={16} /> Generate Report
      </Link>
    </div>
  </div>
);

export const AdminDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = (props) => (
  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-2 text-slate-300 text-xs font-extrabold uppercase">
      <Filter size={16} className="text-blue-400" /> Executive Analytics Scopes
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Location</label>
        <select
          value={props.locationFilter}
          onChange={(e) => props.setLocationFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Delhi">Delhi</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Remote">Remote</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Department</label>
        <select
          value={props.deptFilter}
          onChange={(e) => props.setDeptFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales & Marketing</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Team</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend Devs</option>
          <option value="Backend">Backend Services</option>
          <option value="QA">Quality Assurance</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 font-bold block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>
    </div>
  </div>
);

const calculateTenure = (joinDateStr?: string) => {
  if (!joinDateStr) return 'N/A';
  const joinDate = new Date(joinDateStr);
  const now = new Date();
  if (isNaN(joinDate.getTime()) || joinDate > now) return '0 days';
  
  let years = now.getFullYear() - joinDate.getFullYear();
  let months = now.getMonth() - joinDate.getMonth();
  let days = now.getDate() - joinDate.getDate();
  
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  
  return parts.slice(0, 2).join(' ');
};

const formatJoinDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const AdminEmployeeTable: React.FC<{ filteredEmployees: Employee[] }> = ({ filteredEmployees }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Users size={18} className="text-emerald-500" /> Employee Attendance & Performance Table
      </h3>
      <span className="text-xs text-slate-400 font-semibold bg-slate-950/60 px-3 py-1 rounded-full border border-slate-850">
        Showing {filteredEmployees.length} employees
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[1600px]">
        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4">Employee ID</th>
            <th className="py-3 px-4">Employee Name</th>
            <th className="py-3 px-4">Joining Date</th>
            <th className="py-3 px-4">Employment Status</th>
            <th className="py-3 px-4">Tenure</th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4">Team</th>
            <th className="py-3 px-4">Manager</th>
            <th className="py-3 px-4">Team Lead</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Attendance Status</th>
            <th className="py-3 px-4">Check-In</th>
            <th className="py-3 px-4">Check-Out</th>
            <th className="py-3 px-4">Working Hours</th>
            <th className="py-3 px-4">Break Duration</th>
            <th className="py-3 px-4">Leave Balance</th>
            <th className="py-3 px-4">Last Activity</th>
            <th className="py-3 px-4">Sync Status</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {filteredEmployees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-mono font-bold text-slate-300">
                {emp.employeeCode || emp.code || 'EMP-1000'}
              </td>
              <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                <img src={emp.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80"} className="w-8 h-8 rounded-lg object-cover" alt="" />
                <div>
                  <div>{emp.name}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{emp.designation || 'Specialist'}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-300 font-medium">
                {formatJoinDate(emp.joinDate)}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {emp.status}
                </span>
              </td>
              <td className="py-3 px-4 text-amber-300 font-semibold">
                {calculateTenure(emp.joinDate)}
              </td>
              <td className="py-3 px-4 text-slate-300">{emp.department || 'General'}</td>
              <td className="py-3 px-4 text-slate-400">{emp.team || 'N/A'}</td>
              <td className="py-3 px-4 text-slate-400">{(emp as any).manager || 'Priya Sharma'}</td>
              <td className="py-3 px-4 text-slate-400">{(emp as any).teamLead || 'Arjun Reddy'}</td>
              <td className="py-3 px-4 text-slate-300 font-semibold">{emp.location || 'HQ'}</td>
              <td className="py-3 px-4 text-emerald-400 font-bold">{(emp as any).attendance_status || 'Present'}</td>
              <td className="py-3 px-4 font-mono">{(emp as any).checkIn || '09:32 AM'}</td>
              <td className="py-3 px-4 font-mono">{(emp as any).checkOut || '06:35 PM'}</td>
              <td className="py-3 px-4 font-mono font-bold text-blue-400">{(emp as any).workingHours || '08h 12m'}</td>
              <td className="py-3 px-4 font-mono">{(emp as any).breakDuration || '01h 03m'}</td>
              <td className="py-3 px-4 font-mono text-purple-400 font-bold">{(emp as any).leaveBalance || '12 days'}</td>
              <td className="py-3 px-4 text-slate-400">{(emp as any).lastActivity || 'Check-In'}</td>
              <td className="py-3 px-4 text-teal-400 font-bold">{(emp as any).syncStatus || 'Synced'}</td>
              <td className="py-3 px-4">
                <Link to={`/admin/employees`} className="text-blue-400 hover:text-blue-300 font-extrabold text-[11px]">View</Link>
              </td>
            </tr>
          ))}
          {filteredEmployees.length === 0 && (
            <tr>
              <td colSpan={19} className="py-8 text-center text-slate-500 font-semibold">
                No employees match the selected criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Layers size={18} className="text-blue-500" /> Active Sprint Work
      </h3>
      <span className="badge badge-success text-[10px] font-bold">ORGANIZATION SPRINT</span>
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
          {tasks.slice(0, 8).map((task) => (
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
              <td className="py-3 px-4">
                <span className="text-slate-300 font-bold uppercase">{task.status}</span>
              </td>
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

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

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
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Stackly Enterprise Analytics',
      details,
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesLocation = locationFilter === 'All' || emp.location === locationFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesTeam = teamFilter === 'All' || emp.team === teamFilter;
    return matchesDept && matchesLocation && matchesStatus && matchesTeam;
  });

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.SYSTEM_CONFIG}>
      <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <AdminDashboardOverview
          currentDateFormatted={currentDateFormatted}
          getGreeting={getGreeting}
          firstName={firstName}
          user={user}
        />

        <AdminDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* KPI metrics - Grid controlled by the Page */}
        <div className="dashboard-kpi-grid">
          <MinimalKpiCard
            title="Total Headcount"
            value={employees.length || "500"}
            icon={<Users size={26} />}
            iconBgColor="emerald"
            trend="+12.4% than last month"
            trendType="positive"
            onClick={() => openDrillDown('Total Employee Headcount', employees.length, 'Global workforce roster', [
              { label: 'Full-time Permanent', value: Math.round(employees.length * 0.85) },
              { label: 'Contractors', value: Math.round(employees.length * 0.15) },
            ])}
          />
          <MinimalKpiCard title="Active Duty Rate" value="242" icon={<ShieldCheck size={26} />} iconBgColor="blue" trend="+96.8% active shift" trendType="positive" />
          <MinimalKpiCard title="Attendance Rate" value="96.5%" icon={<Clock size={26} />} iconBgColor="amber" trend="+1.5% compliance" trendType="positive" />
          <MinimalKpiCard title="Annual Attrition" value="4.2%" icon={<TrendingDown size={26} />} iconBgColor="rose" trend="-0.8% than last year" trendType="positive" />
          <MinimalKpiCard title="Monthly Payroll" value="$4.8M" icon={<DollarSign size={26} />} iconBgColor="purple" trend="+4.35% budget allocation" trendType="positive" />
          <MinimalKpiCard title="Productivity Score" value="94.8%" icon={<Award size={26} />} iconBgColor="cyan" trend="+3.2% performance" trendType="positive" />
          <MinimalKpiCard title="Open Vacancies" value="124" icon={<Briefcase size={26} />} iconBgColor="indigo" trend="+8.4% open requisitions" trendType="positive" />
          <MinimalKpiCard title="Audit Compliance" value="99.8%" icon={<Layers size={26} />} iconBgColor="teal" trend="100% Zero-Trust Pass" trendType="positive" />
        </div>

        {/* Primary Analytics Grid */}
        <div className="dashboard-chart-grid">
          <AnalyticsLineChart title="Employee Growth & Hiring" subtitle="Headcount and new hires by join month" data={analytics.data?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#3b82f6' }, { key: 'hiring', name: 'New hires', color: '#06b6d4' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Attendance Overview" subtitle="Present, absent and late attendance by weekday" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }, { key: 'late', name: 'Late', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Department Comparison" subtitle="Headcount and attendance performance by department" data={analytics.data?.departmentComparison} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#6366f1' }, { key: 'attendance', name: 'Attendance %', color: '#10b981' }]} layout="vertical" isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Department Distribution" subtitle="Current workforce allocation" data={analytics.data?.departmentDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        {/* Secondary Analytics Grid */}
        <div className="dashboard-chart-grid !mt-4">
          <AnalyticsDonutChart title="Role Distribution" subtitle="Role mix in the authorized scope" data={analytics.data?.roleDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Employment Status" subtitle="Active, remote, leave and offline workforce" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Workforce Mode" subtitle="Office, remote and client attendance modes" data={analytics.data?.workforceDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Retention Risk" subtitle="Performance and attendance risk distribution" data={analytics.data?.riskDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} colors={['#ef4444', '#f59e0b', '#10b981']} />
        </div>

        <AdminEmployeeTable filteredEmployees={filteredEmployees} />
        <AdminSprintOverview tasks={tasks} />
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </div>
    </RoleGuard>
  );
};
