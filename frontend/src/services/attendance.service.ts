import { apiClient } from './api';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO string
  checkOutTime: string | null; // ISO string
  breaks: Array<{ start: string; end: string | null }>;
  shiftType: 'Regular' | 'Flexible' | 'Overnight';
  workMode: 'Office' | 'Remote' | 'Client';
  status: 'Checked In' | 'On Break' | 'Working' | 'Checked Out';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  idempotencyKey?: string;
}

export interface CorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  managerComment?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  employeeId: string;
  action: string;
  details: string;
}

// Fixed office location coordinates for geofencing (e.g. MAHE office Bangalore)
export const OFFICE_COORDS = { lat: 12.9716, lng: 77.5946 };
export const ALLOWED_RADIUS_METERS = 100;

// Calculate distance between two coordinates in meters
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

class AttendanceService {
  private recordsKey = 'wfa_attendance_records';
  private correctionsKey = 'wfa_attendance_corrections';
  private auditKey = 'wfa_attendance_audit';
  private offlineQueueKey = 'wfa_attendance_offline_queue';

  // Server Time Simulation (never trust browser time - can offset or keep synced)
  getServerTime(): Date {
    return new Date();
  }

  getRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(this.recordsKey);
    return data ? JSON.parse(data) : [];
  }

  saveRecords(records: AttendanceRecord[]) {
    localStorage.setItem(this.recordsKey, JSON.stringify(records));
  }

  getCorrections(): CorrectionRequest[] {
    const data = localStorage.getItem(this.correctionsKey);
    return data ? JSON.parse(data) : [];
  }

  saveCorrections(corrections: CorrectionRequest[]) {
    localStorage.setItem(this.correctionsKey, JSON.stringify(corrections));
  }

  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(this.auditKey);
    return data ? JSON.parse(data) : [];
  }

  logAction(employeeId: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: this.getServerTime().toISOString(),
      employeeId,
      action,
      details,
    };
    logs.unshift(newLog);
    localStorage.setItem(this.auditKey, JSON.stringify(logs));
  }

  // Smart validation and state machine for check-in
  checkIn(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    shiftType: 'Regular' | 'Flexible' | 'Overnight';
    workMode: 'Office' | 'Remote' | 'Client';
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    idempotencyKey?: string;
  }): AttendanceRecord {
    // 1. Idempotency Check
    const records = this.getRecords();
    if (params.idempotencyKey) {
      const existing = records.find((r) => r.idempotencyKey === params.idempotencyKey);
      if (existing) return existing;
    }

    // 2. Active Session check (prevent duplicate check-in or multiple active sessions)
    const active = records.find((r) => r.employeeId === params.employeeId && r.status !== 'Checked Out');
    if (active) {
      throw new Error('Active session already exists. Must check out first.');
    }

    // 3. Geofencing check for In-Office mode
    if (params.workMode === 'Office') {
      if (params.latitude === undefined || params.longitude === undefined) {
        throw new Error('Location permissions are required for In-Office check-in.');
      }
      const distance = getDistance(params.latitude, params.longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      if (distance > ALLOWED_RADIUS_METERS) {
        throw new Error(`Geofencing validation failed. You are outside the office boundary (${Math.round(distance)}m away).`);
      }
    }

    // 4. Create record
    const serverTime = this.getServerTime();
    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      date: (() => {
        const format = serverTime.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
        const [month, day, year] = format.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      })(),
      checkInTime: serverTime.toISOString(),
      checkOutTime: null,
      breaks: [],
      shiftType: params.shiftType,
      workMode: params.workMode,
      status: 'Checked In',
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy: params.accuracy,
      idempotencyKey: params.idempotencyKey,
    };

    records.push(newRecord);
    this.saveRecords(records);
    this.logAction(params.employeeId, 'CHECK_IN', `Checked in using ${params.workMode} mode on ${params.shiftType} shift`);

    return newRecord;
  }

  takeBreak(employeeId: string) {
    const records = this.getRecords();
    const index = records.findIndex((r) => r.employeeId === employeeId && r.status !== 'Checked Out');
    if (index === -1) throw new Error('No active check-in session found.');
    
    const record = records[index];
    if (record.status === 'On Break') throw new Error('Already on break.');

    record.status = 'On Break';
    record.breaks.push({
      start: this.getServerTime().toISOString(),
      end: null,
    });

    records[index] = record;
    this.saveRecords(records);
    this.logAction(employeeId, 'BREAK_START', 'Started break');

  }

  resumeWork(employeeId: string) {
    const records = this.getRecords();
    const index = records.findIndex((r) => r.employeeId === employeeId && r.status === 'On Break');
    if (index === -1) throw new Error('Employee is not on an active break.');

    const record = records[index];
    const activeBreakIndex = record.breaks.findIndex((b) => b.end === null);
    if (activeBreakIndex !== -1) {
      record.breaks[activeBreakIndex].end = this.getServerTime().toISOString();
    }

    record.status = 'Working';
    records[index] = record;
    this.saveRecords(records);
    this.logAction(employeeId, 'BREAK_END', 'Resumed work');

  }

  checkOut(employeeId: string) {
    const records = this.getRecords();
    const index = records.findIndex((r) => r.employeeId === employeeId && r.status !== 'Checked Out');
    if (index === -1) throw new Error('Check-out-before-check-in rejection. No active session found.');

    const record = records[index];
    
    // Close break if active
    if (record.status === 'On Break') {
      const activeBreakIndex = record.breaks.findIndex((b) => b.end === null);
      if (activeBreakIndex !== -1) {
        record.breaks[activeBreakIndex].end = this.getServerTime().toISOString();
      }
    }

    record.checkOutTime = this.getServerTime().toISOString();
    record.status = 'Checked Out';

    records[index] = record;
    this.saveRecords(records);
    this.logAction(employeeId, 'CHECK_OUT', 'Checked out from active session');

  }

  // Offline queue mechanisms
  getOfflineQueue(): any[] {
    const data = localStorage.getItem(this.offlineQueueKey);
    return data ? JSON.parse(data) : [];
  }

  saveOfflineQueue(queue: any[]) {
    localStorage.setItem(this.offlineQueueKey, JSON.stringify(queue));
  }

  enqueueOfflineAction(action: any) {
    const queue = this.getOfflineQueue();
    queue.push(action);
    this.saveOfflineQueue(queue);
  }

  syncOfflineActions(): { syncedCount: number; errors: string[] } {
    const queue = this.getOfflineQueue();
    const errors: string[] = [];
    let syncedCount = 0;

    for (const action of queue) {
      try {
        if (action.type === 'CHECK_IN') {
          this.checkIn(action.payload);
        } else if (action.type === 'BREAK_START') {
          this.takeBreak(action.payload.employeeId);
        } else if (action.type === 'BREAK_END') {
          this.resumeWork(action.payload.employeeId);
        } else if (action.type === 'CHECK_OUT') {
          this.checkOut(action.payload.employeeId);
        }
        syncedCount++;
      } catch (err: any) {
        errors.push(err.message || 'Error processing sync action');
      }
    }

    this.saveOfflineQueue([]);
    return { syncedCount, errors };
  }

  // Shifts calculations and hours mapping
  calculateHours(record: AttendanceRecord): {
    workingHours: number;
    breakDuration: number;
    overtime: number;
    lateArrival: boolean;
    earlyDeparture: boolean;
  } {
    const checkIn = new Date(record.checkInTime);
    const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : this.getServerTime();

    // Total session duration in hours
    const totalDurationHrs = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    // Calculate total break duration in hours
    let breakDurationHrs = 0;
    record.breaks.forEach((b) => {
      const start = new Date(b.start);
      const end = b.end ? new Date(b.end) : this.getServerTime();
      breakDurationHrs += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    });

    const workingHours = Math.max(0, totalDurationHrs - breakDurationHrs);
    
    // Shift boundaries & rules
    let lateArrival = false;
    let earlyDeparture = false;
    let overtime = 0;

    if (record.shiftType === 'Regular') {
      // Regular Shift: 9 AM target start, 6 PM target end
      const checkInHour = checkIn.getHours() + checkIn.getMinutes() / 60;
      if (checkInHour > 9.25) { // late if checked in after 9:15 AM
        lateArrival = true;
      }
      
      if (record.checkOutTime) {
        const checkOutHour = checkOut.getHours() + checkOut.getMinutes() / 60;
        if (checkOutHour < 17.75) { // early if checked out before 5:45 PM
          earlyDeparture = true;
        }
      }

      if (workingHours > 8.0) {
        overtime = workingHours - 8.0;
      }
    } else if (record.shiftType === 'Overnight') {
      // Overnight Shift (typically cross-midnight, e.g. 9 PM to 6 AM)
      const checkInHour = checkIn.getHours() + checkIn.getMinutes() / 60;
      // If checked in between 9 PM (21.0) and midnight
      if (checkInHour > 21.25 && checkInHour < 24) {
        lateArrival = true;
      }

      if (workingHours > 8.0) {
        overtime = workingHours - 8.0;
      }
    } else {
      // Flexible
      if (workingHours > 8.0) {
        overtime = workingHours - 8.0;
      }
    }

    return {
      workingHours: Number(workingHours.toFixed(2)),
      breakDuration: Number(breakDurationHrs.toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
      lateArrival,
      earlyDeparture,
    };
  }

  // Corrections requests workflows
  submitCorrectionRequest(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    date: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
  }): CorrectionRequest {
    const corrections = this.getCorrections();
    const newReq: CorrectionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      date: params.date,
      requestedCheckIn: params.requestedCheckIn,
      requestedCheckOut: params.requestedCheckOut,
      reason: params.reason,
      status: 'Pending',
      createdAt: this.getServerTime().toISOString(),
    };
    corrections.push(newReq);
    this.saveCorrections(corrections);
    this.logAction(params.employeeId, 'CORRECTION_REQUESTED', `Submitted correction request for ${params.date}`);

    return newReq;
  }

  reviewCorrectionRequest(reqId: string, status: 'Approved' | 'Rejected', comment: string, reviewerName: string) {
    const corrections = this.getCorrections();
    const index = corrections.findIndex((c) => c.id === reqId);
    if (index === -1) throw new Error('Correction request not found.');

    const req = corrections[index];
    req.status = status;
    req.managerComment = comment;
    req.reviewedBy = reviewerName;

    corrections[index] = req;
    this.saveCorrections(corrections);

    if (status === 'Approved') {
      // Update or create the attendance record
      const records = this.getRecords();
      const existingRecordIndex = records.findIndex((r) => r.employeeId === req.employeeId && r.date === req.date);
      
      const updatedRecord: AttendanceRecord = {
        id: existingRecordIndex !== -1 ? records[existingRecordIndex].id : Math.random().toString(36).substr(2, 9),
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        department: req.department,
        date: req.date,
        checkInTime: new Date(`${req.date}T${req.requestedCheckIn}`).toISOString(),
        checkOutTime: new Date(`${req.date}T${req.requestedCheckOut}`).toISOString(),
        breaks: [],
        shiftType: 'Regular',
        workMode: 'Office',
        status: 'Checked Out',
      };

      if (existingRecordIndex !== -1) {
        records[existingRecordIndex] = updatedRecord;
      } else {
        records.push(updatedRecord);
      }
      this.saveRecords(records);
    }

    this.logAction(req.employeeId, `CORRECTION_${status.toUpperCase()}`, `Manager reviewed correction request: ${status}`);

  }

  private unwrapResponse<T>(response: { data?: { success?: boolean; data?: T; message?: string } }): T {
    if (response.data?.success) return response.data.data as T;
    throw new Error(response.data?.message || 'Attendance request failed.');
  }

  async checkInRemote(params: Parameters<AttendanceService['checkIn']>[0]): Promise<AttendanceRecord> {
    const response = await apiClient.post('/v1/attendance/check-in', params);
    const record = this.unwrapResponse<AttendanceRecord>(response);
    const records = this.getRecords().filter((item) => item.id !== record.id);
    this.saveRecords([...records, record]);
    return record;
  }

  async transitionRemote(action: 'break' | 'resume' | 'check-out', employeeId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post(`/v1/attendance/${action}`, { employeeId });
    const record = this.unwrapResponse<AttendanceRecord>(response);
    const records = this.getRecords().filter((item) => item.id !== record.id);
    this.saveRecords([...records, record]);
    return record;
  }

  async submitCorrectionRemote(params: Parameters<AttendanceService['submitCorrectionRequest']>[0]): Promise<CorrectionRequest> {
    const response = await apiClient.post('/v1/attendance/corrections', params);
    const result = this.unwrapResponse<{ id: string; status: CorrectionRequest['status'] }>(response);
    const request: CorrectionRequest = { ...params, ...result, createdAt: new Date().toISOString() };
    this.saveCorrections([request, ...this.getCorrections().filter((item) => item.id !== request.id)]);
    return request;
  }

  async reviewCorrectionRemote(reqId: string, status: 'Approved' | 'Rejected', comment: string): Promise<void> {
    this.unwrapResponse(await apiClient.put(`/v1/attendance/corrections/${reqId}`, { status, managerComment: comment }));
  }

  async syncOfflineActionsRemote(): Promise<{ syncedCount: number; errors: string[] }> {
    const queue = this.getOfflineQueue();
    const remaining: any[] = [];
    const errors: string[] = [];
    let syncedCount = 0;

    for (const action of queue) {
      try {
        if (action.type === 'CHECK_IN') await this.checkInRemote(action.payload);
        else if (action.type === 'BREAK_START') await this.transitionRemote('break', action.payload.employeeId);
        else if (action.type === 'BREAK_END') await this.transitionRemote('resume', action.payload.employeeId);
        else if (action.type === 'CHECK_OUT') await this.transitionRemote('check-out', action.payload.employeeId);
        syncedCount += 1;
      } catch (err: any) {
        remaining.push(action);
        errors.push(err.message || 'Error processing sync action');
      }
    }

    this.saveOfflineQueue(remaining);
    return { syncedCount, errors };
  }
}

export const attendanceService = new AttendanceService();
