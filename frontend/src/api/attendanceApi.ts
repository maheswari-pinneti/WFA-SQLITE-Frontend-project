import { apiClient } from './client';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workMode: string;
  latitude: number | null;
  longitude: number | null;
  breaks: any[];
}

export interface CorrectionRequest {
  id: string;
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
  reason: string;
  status: string;
  managerComment: string | null;
}

export const attendanceApi = {
  getTodayAttendance: async (): Promise<AttendanceRecord | null> => {
    const response = await apiClient.get('/v1/attendance/today');
    if (response.data?.success) return response.data.data;
    return null;
  },

  checkIn: async (params: { workMode: 'Office' | 'Remote'; latitude?: number; longitude?: number }): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/v1/attendance/check-in', params);
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Check-in failed.');
  },

  takeBreak: async (): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/v1/attendance/break');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Break failed.');
  },

  resumeWork: async (): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/v1/attendance/resume');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Resume work failed.');
  },

  checkOut: async (): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/v1/attendance/check-out');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Check-out failed.');
  },

  getRecords: async (params?: { employeeId?: string; startDate?: string; endDate?: string }): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get('/v1/attendance/records', { params });
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to load records.');
  },

  getShifts: async (): Promise<any[]> => {
    const response = await apiClient.get('/v1/attendance/shifts');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to load shifts.');
  },

  getAuditLogs: async (): Promise<any[]> => {
    const response = await apiClient.get('/v1/attendance/audit-logs');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to load audit logs.');
  },

  submitCorrection: async (params: { attendanceId: string; requestedCheckIn?: string; requestedCheckOut?: string; reason: string }): Promise<CorrectionRequest> => {
    const response = await apiClient.post('/v1/attendance/corrections', params);
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to submit correction.');
  },

  getCorrections: async (): Promise<CorrectionRequest[]> => {
    const response = await apiClient.get('/v1/attendance/corrections');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to load correction requests.');
  },

  reviewCorrection: async (id: string, status: 'APPROVED' | 'REJECTED', comment?: string): Promise<CorrectionRequest> => {
    const response = await apiClient.put(`/v1/attendance/corrections/${id}`, { status, managerComment: comment });
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to review correction.');
  }
};
