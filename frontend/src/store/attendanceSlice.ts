import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendanceRecord, CorrectionRequest, AuditLog, attendanceService } from '../services/attendance.service';
import { apiClient } from '../services/api';

interface AttendanceState {
  activeRecord: AttendanceRecord | null;
  records: AttendanceRecord[];
  corrections: CorrectionRequest[];
  auditLogs: AuditLog[];
  isOffline: boolean;
  offlineQueueLength: number;
  isLoading: boolean;
  error: string | null;
  notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'success'; timestamp: string }>;
}

const initialState: AttendanceState = {
  activeRecord: null,
  records: [],
  corrections: [],
  auditLogs: [],
  isOffline: !navigator.onLine,
  offlineQueueLength: 0,
  isLoading: false,
  error: null,
  notifications: [],
};

export const fetchAttendanceDataThunk = createAsyncThunk(
  'attendance/fetchData',
  async (employeeId: string, { dispatch }) => {
    try {
      const recordsRes = await apiClient.get('/v1/attendance/records');
      if (recordsRes.data && recordsRes.data.success) {
        attendanceService.saveRecords(recordsRes.data.data);
      }

      const correctionsRes = await apiClient.get('/v1/attendance/corrections');
      if (correctionsRes.data && correctionsRes.data.success) {
        attendanceService.saveCorrections(correctionsRes.data.data);
      }
      const auditRes = await apiClient.get('/v1/attendance/audit-logs');
      if (auditRes.data && auditRes.data.success) {
        localStorage.setItem('wfa_attendance_audit', JSON.stringify(auditRes.data.data));
      }
    } catch (err) {
      console.warn('Offline or unable to fetch from server, fallback to local storage cache.', err);
    }
    dispatch(syncLocalData({ employeeId }));
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setOfflineState(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    syncLocalData(state, action: PayloadAction<{ employeeId: string }>) {
      state.records = attendanceService.getRecords();
      state.corrections = attendanceService.getCorrections();
      state.auditLogs = attendanceService.getAuditLogs();
      state.offlineQueueLength = attendanceService.getOfflineQueue().length;
      
      const active = state.records.find((r) => r.employeeId === action.payload.employeeId && r.status !== 'Checked Out');
      state.activeRecord = active || null;
    },
    addNotification(state, action: PayloadAction<{ message: string; type: 'info' | 'warning' | 'success' }>) {
      state.notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date().toLocaleTimeString(),
      });
    },
    clearNotifications(state) {
      state.notifications = [];
    }
  },
});

export const { setOfflineState, syncLocalData, addNotification, clearNotifications } = attendanceSlice.actions;
export default attendanceSlice.reducer;
