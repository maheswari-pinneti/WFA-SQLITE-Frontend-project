import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { useAuth } from '../../../auth/hooks/useAuth';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { attendanceApi, AttendanceRecord, CorrectionRequest } from '../../../api/attendanceApi';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { Clock, Calendar, FileText, Compass, CheckCircle2, AlertCircle, Plus, Layers, ClipboardList, Briefcase, Award, Filter, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';

// 1. Employee Dashboard Overview component
export const EmployeeDashboardOverview: React.FC<{ user: any }> = ({ user }) => (
  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
    <div className="flex items-center gap-4">
      <img
        src={user?.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
        alt={user?.name || "Employee"}
        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
      />
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Welcome back, {user?.name || "Employee"}!</h2>
          <span className="badge badge-success">MY WORKSPACE</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {user?.title || "Full Stack Developer"} • {user?.department || "Engineering & Technology Department"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Link to="/employee/profile" className="btn btn-secondary btn-sm flex items-center gap-1.5">
        <Compass size={14} /> My Profile
      </Link>
    </div>
  </div>
);

// 2. Employee Dashboard Filters component
export const EmployeeDashboardFilters: React.FC<{ dateFilter: string; setDateFilter: (val: string) => void }> = ({ dateFilter, setDateFilter }) => (
  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4">
    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase">
      <Filter size={16} className="text-emerald-400" /> Filter Dashboard:
    </div>
    <input
      type="date"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-semibold"
    />
  </div>
);

// 3. Employee KPI Cards
export const EmployeeKpiGrid: React.FC<{
  hoursToday: string;
  hoursThisWeek: string;
  attendanceRate: string;
  leaveBalance: string;
  leavesUsed: string;
  pendingTasksCount: number;
  goalProgress: string;
  timesheetStatus: string;
}> = (props) => (
  <div className="dashboard-kpi-grid">
    <MinimalKpiCard title="Hours Today" value={props.hoursToday} icon={<Clock size={26} />} iconBgColor="blue" trend="Today's Active Shift" />
    <MinimalKpiCard title="Hours This Week" value={props.hoursThisWeek} icon={<Briefcase size={26} />} iconBgColor="emerald" trend="Current Week" />
    <MinimalKpiCard title="Attendance Rate" value={props.attendanceRate} icon={<Calendar size={26} />} iconBgColor="teal" trend="Lifetime Adherence" />
    <MinimalKpiCard title="Leave Balance" value={props.leaveBalance} icon={<Layers size={26} />} iconBgColor="purple" trend="Available Days" />
    <MinimalKpiCard title="Leaves Used" value={props.leavesUsed} icon={<FileText size={26} />} iconBgColor="rose" trend="This Calendar Year" />
    <MinimalKpiCard title="Pending Tasks" value={props.pendingTasksCount} icon={<AlertCircle size={26} />} iconBgColor="amber" trend="In Sprint Backlog" />
    <MinimalKpiCard title="Goal Progress" value={props.goalProgress} icon={<Award size={26} />} iconBgColor="cyan" trend="Target Achievement" />
    <MinimalKpiCard title="Timesheet Status" value={props.timesheetStatus} icon={<CheckCircle2 size={26} />} iconBgColor="indigo" trend="Daily Verification" />
  </div>
);

// 4. Employee Attendance Table
export const EmployeeAttendanceTable: React.FC<{
  filteredHistory: any[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = ({ filteredHistory, statusFilter, setStatusFilter }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 w-full max-w-full min-w-0">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <ClipboardList size={18} className="text-emerald-500" /> Attendance History
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-semibold">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-semibold"
        >
          <option value="All">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
          <option value="Weekend">Weekend</option>
        </select>
      </div>
    </div>
    <div className="overflow-auto max-h-[400px] rounded-xl border border-slate-800 bg-slate-950/20 w-full max-w-full min-w-0">
      <table className="w-full text-left text-xs min-w-[850px]">
        <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
          <tr>
            <th className="py-3 px-4 w-[160px]">Date</th>
            <th className="py-3 px-4 w-[120px]">Status</th>
            <th className="py-3 px-4 w-[120px]">Check-In</th>
            <th className="py-3 px-4 w-[120px]">Check-Out</th>
            <th className="py-3 px-4 w-[120px]">Duration</th>
            <th className="py-3 px-4">Remarks</th>
            <th className="py-3 px-4 w-[80px]">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {filteredHistory.map((h, i) => (
            <tr key={i} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-white">{h.date}</td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  h.status === 'Present' || h.status === 'Checked In' || h.status === 'Working'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : h.status === 'Absent'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : h.status === 'Weekend'
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {h.status}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.in}</td>
              <td className="py-3 px-4 font-mono text-rose-400 font-bold">{h.out}</td>
              <td className="py-3 px-4 font-mono text-blue-400 font-bold">{h.workingTime}</td>
              <td className="py-3 px-4 text-slate-300 font-medium">{h.remarks || '—'}</td>
              <td className="py-3 px-4">
                <Link to="/employee/corrections" className="text-blue-400 hover:text-blue-300 font-extrabold text-[11px]">Edit</Link>
              </td>
            </tr>
          ))}
          {filteredHistory.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                No matching daily logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// 4b. Leave Balance Card
export const LeaveBalanceCard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between h-full">
    <div className="space-y-4">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <Layers size={18} className="text-purple-400" /> Your leave balance
      </h3>
      <div className="space-y-3 text-xs text-slate-300">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="font-semibold text-slate-400">Casual Leave</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">2 / 2</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="font-semibold text-slate-400">Sick Leave</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">2 / 2</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="font-semibold text-slate-400">Maternity Leave</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">0 / 0</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
          <span className="font-semibold text-slate-400">Paternity Leave</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">0 / 0</span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="font-semibold text-slate-400">Marriage Leave</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">0 / 0</span>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
      Available for Calendar Year 2026
    </div>
  </div>
);

// 4c. Leave Actions Card
export const LeaveActionsCard: React.FC = () => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between h-full">
    <div className="space-y-4">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
        <HeartHandshake size={18} className="text-rose-400" /> Leave
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Need time off? Plan your leaves and submit requests for approvals securely.
      </p>
      <Link 
        to="/employee/leave" 
        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg cursor-pointer"
      >
        <Plus size={14} /> Apply Leave
      </Link>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
      Automatic Routing to Manager
    </div>
  </div>
);

// 5. Employee Sprint Work
export const EmployeeSprintWork: React.FC<{
  tasks: Task[];
  loading: boolean;
  handleUpdateTaskStatus: (id: string, stat: Task['status']) => void;
}> = ({ tasks, loading, handleUpdateTaskStatus }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Layers className="text-blue-400" size={22} /> Sprint Work
      </h3>
      <span className="text-xs text-slate-400 font-semibold bg-slate-950/60 px-3 py-1 rounded-full border border-slate-850">
        Sprint Tasks Active
      </span>
    </div>
    {loading ? (
      <div className="flex justify-center items-center py-10">
        <div className="loading loading-spinner text-blue-500"></div>
      </div>
    ) : tasks.length === 0 ? (
      <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-slate-850 border-dashed">
        <p className="text-sm text-slate-400 font-medium">No active tasks in current sprint</p>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr className="text-slate-400 border-b border-slate-850 pb-2">
              <th className="py-2.5 font-semibold">Task Title</th>
              <th className="py-2.5 font-semibold text-center">Points</th>
              <th className="py-2.5 font-semibold">Priority</th>
              <th className="py-2.5 font-semibold">Sprint Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b border-slate-850/60 hover:bg-slate-950/20">
                <td className="py-3 font-medium text-white max-w-[250px] truncate">{task.title}</td>
                <td className="py-3 text-center">
                  <span className="bg-slate-950 text-slate-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-slate-800">
                    {task.points} SP
                  </span>
                </td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    task.priority === 'CRITICAL' || task.priority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const analytics = useAnalyticsData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedAttendance, fetchedCorrections] = await Promise.all([
          workforceApi.getTasks().catch(() => []),
          attendanceApi.getRecords().catch(() => []),
          attendanceApi.getCorrections().catch(() => [])
        ]);
        setTasks(fetchedTasks);
        setAttendanceRecords(fetchedAttendance);
        setCorrections(fetchedCorrections);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await workforceApi.updateTask(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const history = attendanceRecords.map((record) => {
    const totalBreakMs = record.breaks ? record.breaks.reduce((acc: number, b: any) => {
      const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
      const start = new Date(b.startTime).getTime();
      return acc + (end - start);
    }, 0) : 0;
    
    const breakHours = (totalBreakMs / 3600000).toFixed(2);
    const breakStr = `${breakHours} hrs`;

    const totalWorkMs = record.checkOutTime 
      ? (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime || '').getTime()) 
      : (Date.now() - new Date(record.checkInTime || '').getTime());
    
    const netWorkMs = Math.max(0, totalWorkMs - totalBreakMs);
    const workingHours = (netWorkMs / 3600000).toFixed(2);
    const workingTimeStr = `${workingHours} hrs`;

    const checkInDate = record.checkInTime ? new Date(record.checkInTime) : new Date(record.date);
    const dayOfWeek = checkInDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const checkInHour = checkInDate.getHours();
    const checkInMin = checkInDate.getMinutes();
    const lateMinutes = record.checkInTime ? (checkInHour * 60 + checkInMin) - (9 * 60) : 0;
    const lateStr = lateMinutes > 0 ? `${lateMinutes} mins` : 'On Time';

    const netHours = netWorkMs / 3600000;
    const overtimeHrs = netHours > 8 ? (netHours - 8).toFixed(2) : '0.00';
    const overtimeStr = `${overtimeHrs} hrs`;

    const status = isWeekend 
      ? 'Weekend' 
      : (record.status === 'Leave' || record.status === 'On Leave' 
          ? 'Leave' 
          : (record.checkInTime ? (record.checkOutTime ? 'Present' : 'Checked In') : 'Absent'));

    // Remarks construction
    let remarks = '—';
    if (isWeekend) {
      remarks = 'Weekend';
    } else if (status === 'Leave') {
      remarks = 'Leave';
    } else if (record.checkInTime) {
      const parts = [];
      if (totalBreakMs > 0) parts.push(`Break: ${breakStr}`);
      if (lateMinutes > 0) parts.push(`Late: ${lateStr}`);
      if (netHours > 8) parts.push(`OT: ${overtimeStr}`);
      remarks = parts.length > 0 ? parts.join(', ') : 'Regular shift';
    }

    return {
      date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      rawDate: record.date,
      in: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      out: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (record.checkInTime ? 'Active' : '—'),
      workingTime: record.checkInTime ? workingTimeStr : '—',
      workingHoursNum: record.checkInTime ? netHours : 0,
      break: breakStr,
      late: lateStr,
      overtime: overtimeStr,
      status: status,
      remarks: remarks
    };
  });

  const filteredHistory = history.filter(h => {
    const matchesStatus = statusFilter === 'All' || h.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || h.rawDate.includes(dateFilter);
    return matchesStatus && matchesDate;
  });

  const todayRecord = history.find(h => {
    const todayStr = new Date().toISOString().split('T')[0];
    return h.rawDate === todayStr;
  });
  const hoursToday = todayRecord ? `${todayRecord.workingTime}` : '0.00 hrs';

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const hoursThisWeekNum = history.reduce((acc, h) => {
    const recordDate = new Date(h.rawDate);
    if (recordDate >= startOfWeek) {
      return acc + h.workingHoursNum;
    }
    return acc;
  }, 0);
  const hoursThisWeek = `${hoursThisWeekNum.toFixed(2)} hrs`;

  const attendanceRate = history.length > 0 
    ? `${((history.filter(h => h.status !== 'Absent').length / history.length) * 100).toFixed(1)}%` 
    : '100%';

  const leaveBalance = '14 Days';
  const leavesUsed = '4 Days';
  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasksCount = tasks.length;
  const goalProgress = totalTasksCount > 0 
    ? `${Math.round((completedTasksCount / totalTasksCount) * 100)}%` 
    : '0%';
  const timesheetStatus = todayRecord?.out && todayRecord.out !== 'Active' ? 'Submitted' : 'Pending';

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]} requiredPermission={Permission.PROFILE_VIEW}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <EmployeeDashboardOverview user={user} />
        
        <EmployeeDashboardFilters dateFilter={dateFilter} setDateFilter={setDateFilter} />

        <EmployeeKpiGrid
          hoursToday={hoursToday}
          hoursThisWeek={hoursThisWeek}
          attendanceRate={attendanceRate}
          leaveBalance={leaveBalance}
          leavesUsed={leavesUsed}
          pendingTasksCount={pendingTasksCount}
          goalProgress={goalProgress}
          timesheetStatus={timesheetStatus}
        />

        {/* Personal Employee Analytics Grid controlled by the Page */}
        <div className="dashboard-chart-grid">
          <AnalyticsBarChart title="My Daily Work Hours" subtitle="My hours tracked per weekday" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Work Hours', color: '#10b981' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsLineChart title="My Performance History" subtitle="Calculated productivity score index" data={analytics.data?.performance} xKey="name" series={[{ key: 'performance', name: 'Productivity', color: '#0ea5e9' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>
        
        {/* Top Section - Attendance Actions (Left) and Leave Balance Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveCheckInWidget />
          </div>
          <div>
            <LeaveBalanceCard />
          </div>
        </div>

        {/* Middle Section - Attendance Calendar (Left) and Leave Actions Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceCalendarView />
          </div>
          <div>
            <LeaveActionsCard />
          </div>
        </div>

        <EmployeeAttendanceTable
          filteredHistory={filteredHistory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <EmployeeSprintWork
          tasks={tasks}
          loading={loading}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
        />
      </div>
    </RoleGuard>
  );
};
