import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { useAuth } from '../../../auth/hooks/useAuth';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { attendanceApi, CorrectionRequest } from '../../../api/attendanceApi';
import { 
  Clock, Calendar, FileText, Compass, CheckCircle2, AlertCircle, Sparkles, Plus, Play, Check, HelpCircle, Layers, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingCorrections, setLoadingCorrections] = useState(true);

  // Fetch tasks and corrections
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const fetchedTasks = await workforceApi.getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoadingTasks(false);
      }

      try {
        const fetchedCorrections = await attendanceApi.getCorrections();
        setCorrections(fetchedCorrections);
      } catch (err) {
        console.error('Failed to load corrections:', err);
      } finally {
        setLoadingCorrections(false);
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

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]} requiredPermission={Permission.PROFILE_VIEW}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        
        {/* Workspace Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
              alt={user?.name || "Employee"}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Welcome back, {user?.name || "Employee User"}!</h2>
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

        {/* Attendance Action Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveCheckInWidget />
          </div>
          
          {/* Shift Timings Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <ClipboardList className="text-emerald-400" size={20} /> Shift Timings
                </h3>
                <span className="badge badge-success text-[10px] px-2 py-0.5">ACTIVE</span>
              </div>
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-850 flex items-center gap-3">
                  <Clock className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">General Shift</p>
                    <p className="text-sm font-bold text-white">09:00 AM - 05:00 PM</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-850 flex items-center gap-3">
                  <Calendar className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Working Days</p>
                    <p className="text-sm font-bold text-white">Monday - Friday</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-xs text-slate-400">
              <span>Weekly Target: 40 hrs</span>
              <span>Timezone: Local (IST)</span>
            </div>
          </div>
        </div>

        {/* Sprint Work & Tasks */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="text-blue-400" size={22} /> Sprint Work
            </h3>
            <span className="text-xs text-slate-400 font-semibold bg-slate-950/60 px-3 py-1 rounded-full border border-slate-850">
              Sprint Tasks Active
            </span>
          </div>

          {loadingTasks ? (
            <div className="flex justify-center items-center py-10">
              <div className="loading loading-spinner text-blue-500"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-slate-850 border-dashed">
              <p className="text-sm text-slate-400 font-medium">No active tasks in current sprint</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
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

        {/* Correction Requests Widget */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="text-rose-400" size={22} /> Correction Requests
            </h3>
            <Link to="/employee/corrections" className="btn btn-secondary btn-sm flex items-center gap-1">
              <Plus size={14} /> Submit Correction
            </Link>
          </div>

          {loadingCorrections ? (
            <div className="flex justify-center items-center py-10">
              <div className="loading loading-spinner text-rose-500"></div>
            </div>
          ) : corrections.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-slate-850 border-dashed">
              <p className="text-sm text-slate-400 font-medium">No attendance correction requests submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-850 pb-2">
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold">Requested Timings</th>
                    <th className="py-2.5 font-semibold">Reason</th>
                    <th className="py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.slice(0, 5).map(req => (
                    <tr key={req.id} className="border-b border-slate-850/60 hover:bg-slate-950/20">
                      <td className="py-3 font-medium text-white">
                        {new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-slate-300 text-xs">
                        {req.requestedCheckIn ? `In: ${new Date(req.requestedCheckIn).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}` : ''}
                        {req.requestedCheckOut ? ` | Out: ${new Date(req.requestedCheckOut).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}` : ''}
                      </td>
                      <td className="py-3 text-slate-400 max-w-[200px] truncate">{req.reason}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Attendance Calendar */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="text-teal-400" size={22} /> My Attendance History
            </h3>
          </div>
          <AttendanceCalendarView />
        </div>

      </div>
    </RoleGuard>
  );
};
