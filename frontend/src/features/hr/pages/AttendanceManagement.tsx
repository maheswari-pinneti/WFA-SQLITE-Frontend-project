import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { Clock, CheckCircle, MapPin, Search, Bell, AlertTriangle } from 'lucide-react';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { CSVExport } from '../../../components/tables/CSVExport';
import { useDepartmentAccess } from '../../../hooks/useDepartmentAccess';
import { attendanceService } from '../../../services/attendance.service';
import { clearNotifications, fetchAttendanceDataThunk } from '../../../store/attendanceSlice';
import { RootState, AppDispatch } from '../../../app/store';
import { useAuth } from '../../../auth/hooks/useAuth';
import { CorrectionRequests } from '../../../components/attendance/CorrectionRequests';
import { ManagerApprovals } from '../../../components/attendance/ManagerApprovals';

export const AttendanceManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { canAccessDepartment } = useDepartmentAccess();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { records, auditLogs, notifications } = useSelector(
    (state: RootState) => state.attendance
  );

  const employeeId = user?.id || 'emp-001';

  useEffect(() => {
    (dispatch as AppDispatch)(fetchAttendanceDataThunk(employeeId));
  }, [dispatch, employeeId]);

  const allRecords = records;

  const filteredLogs = allRecords.filter((log) => {
    const hasAccess = canAccessDepartment(log.department);
    if (!hasAccess) return false;

    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate live statistics
  const totalEmployeesCount = filteredLogs.length;
  const lateArrivalsCount = filteredLogs.filter(
    (log) => attendanceService.calculateHours(log).lateArrival
  ).length;
  const activeRemoteCount = filteredLogs.filter((log) => log.workMode === 'Remote' && log.status !== 'Checked Out').length;
  
  // Format dates nicely
  const formatTimeStr = (isoStr: string | null) => {
    if (!isoStr) return '--:--';
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Enterprise Attendance & Shift Control Center</h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time daily punch logs, live clock-ins, hours in office calculations, and monthly compliance calendars across all departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CSVExport data={filteredLogs.map(r => ({
              ID: r.id,
              Employee: r.employeeName,
              Department: r.department,
              Date: r.date,
              CheckIn: r.checkInTime,
              CheckOut: r.checkOutTime || 'Active',
              Status: r.status
            }))} filename="Stackly_Enterprise_Attendance_Report" />
          </div>
        </div>

        {/* System Alert Notifications */}
        {notifications.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bell size={14} className="text-yellow-400 animate-bounce" /> Active Notifications
              </span>
              <button
                onClick={() => dispatch(clearNotifications())}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2 text-xs py-1">
                  {n.type === 'warning' ? (
                    <AlertTriangle size={13} className="text-rose-400 mt-0.5" />
                  ) : (
                    <CheckCircle size={13} className="text-emerald-400 mt-0.5" />
                  )}
                  <span className="text-slate-300 flex-1">{n.message}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Check-In / Out Widget */}
        <LiveCheckInWidget />

        {/* Manager/HR Approvals Panel */}
        <ManagerApprovals />

        {/* Correction Request Submissions Panel */}
        <CorrectionRequests />

        {/* KPI Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-emerald-500 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Headcount Monitored</span>
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalEmployeesCount} Employees</div>
            <p className="text-[10px] text-slate-500 font-mono">Dynamic session roster logs</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-amber-500 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Late Arrivals detected</span>
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{lateArrivalsCount} Shifts</div>
            <p className="text-[10px] text-slate-500 font-mono">Late if post 9:15 AM (Regular)</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 border-l-4 border-l-blue-500 shadow-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Remote WFH</span>
              <Clock size={18} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{activeRemoteCount} Active</div>
            <p className="text-[10px] text-slate-500 font-mono">Exempt from local geofencing</p>
          </div>
        </div>

        {/* Interactive Monthly Attendance Calendar */}
        <AttendanceCalendarView />

        {/* Attendance Roster Live Table Feed & Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Feed Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-blue-400" />
                <h3 className="text-base font-extrabold text-white">Daily Attendance Roster</h3>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee or department..."
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Working">Working</option>
                  <option value="On Break">On Break</option>
                  <option value="Checked Out">Checked Out</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Office Hours</th>
                    <th className="py-3 px-4">Work Mode</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLogs.map((log) => {
                    const stats = attendanceService.calculateHours(log);
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {log.employeeName}{' '}
                          <span className="text-[10px] font-mono text-slate-400">({log.employeeId})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{log.department}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                          {formatTimeStr(log.checkInTime)}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-400 font-bold">
                          {formatTimeStr(log.checkOutTime)}
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-400 font-bold">
                          {stats.workingHours} hrs
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            <MapPin size={10} className="text-blue-400" /> {log.workMode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            log.status === 'Working' || log.status === 'Checked In'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.status === 'On Break'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Log */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Security & Attendance Audit Trails</h3>
            <p className="text-xs text-slate-400">
              Immutable logs generated by server activity for security auditing and compliance.
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No audit logs recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-950 text-xs border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="text-blue-400 font-mono">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300">{log.details}</p>
                    <p className="text-[9px] text-slate-650 font-mono">By ID: {log.employeeId}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </RoleGuard>
  );
};
