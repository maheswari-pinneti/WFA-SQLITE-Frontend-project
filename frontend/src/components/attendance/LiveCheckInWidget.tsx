import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Square, Coffee, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { attendanceService, OFFICE_COORDS } from '../../services/attendance.service';
import { syncLocalData, addNotification, fetchAttendanceDataThunk } from '../../store/attendanceSlice';
import { RootState, AppDispatch } from '../../app/store';
import { analyticsApi } from '../../api/endpoints/analytics.api';

interface LiveCheckInWidgetProps {
  employeeName?: string;
  department?: string;
}

export const LiveCheckInWidget: React.FC<LiveCheckInWidgetProps> = ({
  employeeName: propName,
  department: propDept
}) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Local state for shift selection, work mode, and simulation options
  const [shiftType, setShiftType] = useState<'Regular' | 'Flexible' | 'Overnight'>('Regular');
  const [workMode, setWorkMode] = useState<'Office' | 'Remote' | 'Client'>('Office');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [lat, setLat] = useState(OFFICE_COORDS.lat);
  const [lng, setLng] = useState(OFFICE_COORDS.lng);
  
  // Local state to simulate offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [availableShifts, setAvailableShifts] = useState<Array<{ name: 'Regular' | 'Flexible' | 'Overnight'; startTime: string; endTime: string }>>([
    { name: 'Regular', startTime: '09:00', endTime: '18:00' },
    { name: 'Flexible', startTime: '00:00', endTime: '23:59' },
    { name: 'Overnight', startTime: '21:00', endTime: '06:00' }
  ]);

  // Redux state
  const { activeRecord, offlineQueueLength } = useSelector(
    (state: RootState) => state.attendance
  );

  const employeeName = propName || user?.name || 'Alex Mercer';
  const employeeId = user?.id || 'emp-001';
  const department = propDept || user?.department || 'Engineering & Technology';

  // Tick clock
  const [now, setNow] = useState(attendanceService.getServerTime());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(attendanceService.getServerTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with backend database on mount/update
  useEffect(() => {
    (dispatch as AppDispatch)(fetchAttendanceDataThunk(employeeId));
  }, [dispatch, employeeId]);

  useEffect(() => {
    analyticsApi.getShifts().then((shifts) => setAvailableShifts(shifts)).catch(() => undefined);
  }, []);

  // Handle Action dispatchers (with geofencing & offline checks)
  const handleCheckIn = async () => {
    const idempotencyKey = Math.random().toString(36).substr(2, 9);
    const payload = {
      employeeId,
      employeeName,
      department,
      shiftType,
      workMode,
      latitude: useCustomLocation ? lat : OFFICE_COORDS.lat,
      longitude: useCustomLocation ? lng : OFFICE_COORDS.lng,
      accuracy: 5,
      idempotencyKey,
    };

    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'CHECK_IN',
        payload,
      });
      dispatch(addNotification({ message: 'Offline: Check-in queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      const record = await attendanceService.checkInRemote(payload);
      dispatch(addNotification({ message: 'Checked in successfully!', type: 'success' }));
      
      // Overtime or Late arrival warning push
      const stats = attendanceService.calculateHours(record);
      if (stats.lateArrival) {
        dispatch(addNotification({ message: 'Late arrival registered for this shift.', type: 'warning' }));
      }
      
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleTakeBreak = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'BREAK_START',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Break start queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('break', employeeId);
      dispatch(addNotification({ message: 'Break started.', type: 'info' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleResume = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'BREAK_END',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Resume queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('resume', employeeId);
      dispatch(addNotification({ message: 'Resumed work.', type: 'success' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleCheckOut = async () => {
    if (isOfflineMode) {
      attendanceService.enqueueOfflineAction({
        type: 'CHECK_OUT',
        payload: { employeeId },
      });
      dispatch(addNotification({ message: 'Offline: Check-out queued locally.', type: 'warning' }));
      dispatch(syncLocalData({ employeeId }));
      return;
    }

    try {
      await attendanceService.transitionRemote('check-out', employeeId);
      dispatch(addNotification({ message: 'Checked out successfully!', type: 'success' }));
      dispatch(fetchAttendanceDataThunk(employeeId));
    } catch (err: any) {
      dispatch(addNotification({ message: err.message, type: 'warning' }));
    }
  };

  const handleSyncOffline = async () => {
    const res = await attendanceService.syncOfflineActionsRemote();
    if (res.errors.length > 0) {
      dispatch(addNotification({ message: `Sync completed with errors: ${res.errors.join(', ')}`, type: 'warning' }));
    } else {
      dispatch(addNotification({ message: `Successfully synced ${res.syncedCount} actions!`, type: 'success' }));
    }
    dispatch(fetchAttendanceDataThunk(employeeId));
  };

  // Stats for the active record or default placeholder
  const stats = activeRecord
    ? attendanceService.calculateHours(activeRecord)
    : { workingHours: 0, breakDuration: 0, overtime: 0, lateArrival: false, earlyDeparture: false };

  const formatHrsMins = (decimalHours: number) => {
    const totalMins = Math.round(decimalHours * 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-slate-100 font-sans">
      
      {/* Header and Sync States */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-white">Live Attendance & Time Tracker</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              activeRecord
                ? activeRecord.status === 'On Break'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {activeRecord ? `● ${activeRecord.status.toUpperCase()}` : '○ CLOCKED OUT'}
            </span>

            {isOfflineMode ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                <WifiOff size={10} /> Offline Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wifi size={10} /> Online
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {employeeName} • {department}
          </p>
        </div>

        <div className="text-left sm:text-right font-mono">
          <p className="text-xl font-black text-blue-400">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Simulator Controls Panel */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Simulation & Testing Controls</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          
          {/* Shift Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Active Shift Rule</label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value as any)}
              disabled={!!activeRecord}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
            >
              {availableShifts.map((shift) => (
                <option key={shift.name} value={shift.name}>{shift.name} Shift ({shift.startTime} - {shift.endTime})</option>
              ))}
            </select>
          </div>

          {/* Work Mode */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as any)}
              disabled={!!activeRecord}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
            >
              <option value="Office">In-Office (Geofenced)</option>
              <option value="Remote">Remote Work-From-Home</option>
              <option value="Client">Client Site visit</option>
            </select>
          </div>

          {/* Offline simulator toggle */}
          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isOfflineMode}
                onChange={(e) => setIsOfflineMode(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              Simulate Network Offline
            </label>
            {offlineQueueLength > 0 && (
              <button
                onClick={handleSyncOffline}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Sync Offline Actions ({offlineQueueLength})
              </button>
            )}
          </div>
        </div>

        {/* Geofence Simulator settings */}
        {workMode === 'Office' && !activeRecord && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomLocation}
                  onChange={(e) => {
                    setUseCustomLocation(e.target.checked);
                    if (!e.target.checked) {
                      setLat(OFFICE_COORDS.lat);
                      setLng(OFFICE_COORDS.lng);
                    }
                  }}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                Simulate Location Offset (Geofence Breach)
              </label>
            </div>
            {useCustomLocation && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLat(12.9000); // generic offset coordinates
                    setLng(77.5000);
                  }}
                  className="px-2.5 py-1 rounded bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-900/60 transition-colors"
                >
                  Set coordinates outside radius
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-3">
        {!activeRecord ? (
          <button
            onClick={handleCheckIn}
            className="flex-1 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} strokeWidth={2.5} /> Clock In Now
          </button>
        ) : (
          <>
            <button
              onClick={handleCheckOut}
              className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square size={16} strokeWidth={2.5} /> Clock Out
            </button>

            {activeRecord.status !== 'On Break' ? (
              <button
                onClick={handleTakeBreak}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Coffee size={16} /> Take Break
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex-1 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} /> Resume Work
              </button>
            )}
          </>
        )}
      </div>

      {/* Real-time metrics dashboard section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Hours Today</p>
          <p className="text-base font-black text-blue-400 font-mono">
            {formatHrsMins(stats.workingHours)}
          </p>
          <p className="text-[9.5px] text-slate-500">Target: 8h 00m</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Break Duration</p>
          <p className="text-base font-black text-amber-400 font-mono">
            {formatHrsMins(stats.breakDuration)}
          </p>
          <p className="text-[9.5px] text-slate-500">Max Allowed: 1h 00m</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Overtime Hours</p>
          <p className="text-base font-black text-emerald-400 font-mono">
            {formatHrsMins(stats.overtime)}
          </p>
          <p className="text-[9.5px] text-slate-500">Over 8.0 hrs</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Late / Early Out</p>
          <div className="flex items-center gap-1 mt-0.5">
            {stats.lateArrival ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">LATE ARRIVAL</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">ON TIME</span>
            )}
            {stats.earlyDeparture && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">EARLY OUT</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
