import mongoose from '../config/mongoose.js';
import { attendanceRepository } from '../repositories/attendance.repository.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { Attendance, Correction, BreakSession, AttendanceEvent, IdempotencyRecord } from '../models/Attendance.js';
import { Employee } from '../models/Employee.js';
import { AuditLog } from '../models/AuditLog.js';
import { logAudit } from '../config/db.js';
import * as notificationService from './notification.service.js';

const OFFICE_COORDS = { lat: 12.9716, lng: 77.5946 };
const ALLOWED_RADIUS_METERS = 100;
const MAX_LOCATION_ACCURACY_METERS = 100;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2
    + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export class AttendanceService {
  async findIdentity(employeeId, orgId) {
    let identity = await employeeRepository.findById(employeeId, orgId);
    if (!identity) {
      identity = await userRepository.findById(employeeId, orgId);
    }
    return identity;
  }

  async checkIn(reqUser, punchData) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const employeeId = reqUser.role === 'EMPLOYEE' ? reqUser.id : punchData.employeeId;
    const { shiftType, workMode, latitude, longitude, accuracy, idempotencyKey } = punchData;

    if (!employeeId || !shiftType || !workMode) {
      throw new Error('Employee, shift and work mode are required.');
    }

    const identity = await this.findIdentity(employeeId, orgId);
    if (!identity) {
      throw new Error('Employee is outside the active organization.');
    }

    if (workMode === 'Office') {
      if (latitude === undefined || longitude === undefined) {
        logAudit(employeeId, 'GEOFENCE_VIOLATION', 'Office check-in rejected: missing coordinates', orgId);
        notificationService.triggerAlarm(employeeId, identity.name, 'GEOFENCE_VIOLATION', 'Office check-in attempted without coordinates.');
        throw new Error('Location coordinates required for Office check-in.');
      }
      if (accuracy !== undefined && (!Number.isFinite(Number(accuracy)) || Number(accuracy) > MAX_LOCATION_ACCURACY_METERS)) {
        throw new Error('Location accuracy is insufficient for Office check-in.');
      }
      const distance = getDistance(latitude, longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      if (distance > ALLOWED_RADIUS_METERS) {
        logAudit(employeeId, 'GEOFENCE_VIOLATION', `Office check-in rejected: ${Math.round(distance)}m away`, orgId);
        notificationService.triggerAlarm(employeeId, identity.name, 'GEOFENCE_VIOLATION', `Office check-in rejected: ${Math.round(distance)}m away`);
        throw new Error(`Geofencing validation failed. You are outside the office boundary (${Math.round(distance)}m away).`);
      }
    }

    // 🔐 Idempotency check FIRST
    if (idempotencyKey) {
      const existing = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey });
      if (existing) {
        return { data: existing.response.data, idempotentReplay: true };
      }
    }

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        if (idempotencyKey) {
          const existingTx = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey }).session(session);
          if (existingTx) {
            result = existingTx.response;
            return;
          }
        }

        // Double check-in check
        const activeSession = await Attendance.findOne({
          employeeId,
          companyId: orgId,
          status: { $ne: 'Checked Out' }
        }).session(session);

        if (activeSession) {
          notificationService.triggerAlarm(employeeId, identity.name, 'DUPLICATE_CHECKIN_ATTEMPT', 'Active session already exists.');
          throw new Error('Active session already exists. Must check out first.');
        }

        const id = Math.random().toString(36).slice(2, 11);
        const date = new Date().toISOString().split('T')[0];
        const checkInTime = new Date().toISOString();

        const record = await Attendance.create([{
          id,
          employeeId,
          employeeName: identity.name,
          department: identity.department,
          date,
          checkInTime,
          checkOutTime: null,
          breaks: [],
          shiftType,
          workMode,
          status: 'Checked In',
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          accuracy: accuracy ?? null,
          idempotencyKey: idempotencyKey || null,
          team: identity.team,
          organizationId: orgId,
          companyId: orgId
        }], { session });

        // Create Check-In event
        await AttendanceEvent.create([{
          id: Math.random().toString(36).slice(2, 11),
          companyId: orgId,
          employeeId,
          attendanceRecordId: record[0]._id,
          type: 'CHECK_IN',
          timestamp: checkInTime
        }], { session });

        result = { success: true, data: record[0] };

        if (idempotencyKey) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await IdempotencyRecord.create([{
            companyId: orgId,
            key: idempotencyKey,
            statusCode: 200,
            response: result,
            expiresAt
          }], { session });
        }
      });

      logAudit(employeeId, 'CHECK_IN', `Checked in using ${workMode} mode on ${shiftType} shift`, orgId);
      notificationService.triggerGoogleCalendarNotification(employeeId, identity.name, 'Office Login Check-In', new Date().toISOString().split('T')[0]);
      
      return { data: result.data, idempotentReplay: false };
    } catch (err) {
      if (idempotencyKey) {
        const committedRecord = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey });
        if (committedRecord) {
          return { data: committedRecord.response.data, idempotentReplay: true };
        }
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async takeBreak(reqUser, bodyData) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const employeeId = reqUser.role === 'EMPLOYEE' ? reqUser.id : bodyData.employeeId;

    const session = await mongoose.startSession();
    try {
      let record;
      await session.withTransaction(async () => {
        record = await Attendance.findOne({ employeeId, companyId: orgId, status: { $ne: 'Checked Out' } }).session(session);
        if (!record) {
          throw new Error('No active check-in session found.');
        }
        if (record.status === 'On Break') {
          throw new Error('Already on break.');
        }

        const nowStr = new Date().toISOString();
        const breakId = Math.random().toString(36).slice(2, 11);

        // Create BreakSession record
        await BreakSession.create([{
          id: breakId,
          companyId: orgId,
          attendanceRecordId: record._id,
          startTime: nowStr,
          status: 'ACTIVE'
        }], { session });

        // Create Event
        await AttendanceEvent.create([{
          id: Math.random().toString(36).slice(2, 11),
          companyId: orgId,
          employeeId,
          attendanceRecordId: record._id,
          type: 'BREAK_START',
          timestamp: nowStr
        }], { session });

        const breaksList = Array.isArray(record.breaks) ? [...record.breaks] : [];
        breaksList.push({ start: nowStr, end: null });

        record.status = 'On Break';
        record.breaks = breaksList;
        await record.save({ session });
      });

      logAudit(employeeId, 'BREAK_START', 'Started break', orgId);
      return record;
    } catch (err) {
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async resumeWork(reqUser, bodyData) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const employeeId = reqUser.role === 'EMPLOYEE' ? reqUser.id : bodyData.employeeId;

    const session = await mongoose.startSession();
    try {
      let record;
      await session.withTransaction(async () => {
        record = await Attendance.findOne({ employeeId, companyId: orgId, status: 'On Break' }).session(session);
        if (!record) {
          throw new Error('Employee is not on an active break.');
        }

        const nowStr = new Date().toISOString();

        // Update BreakSession record
        const activeBreak = await BreakSession.findOne({
          attendanceRecordId: record._id,
          companyId: orgId,
          status: 'ACTIVE'
        }).session(session);

        if (activeBreak) {
          activeBreak.endTime = nowStr;
          activeBreak.status = 'COMPLETED';
          await activeBreak.save({ session });
        }

        // Create Event
        await AttendanceEvent.create([{
          id: Math.random().toString(36).slice(2, 11),
          companyId: orgId,
          employeeId,
          attendanceRecordId: record._id,
          type: 'BREAK_END',
          timestamp: nowStr
        }], { session });

        const breaksList = Array.isArray(record.breaks) ? [...record.breaks] : [];
        const recordActiveBreak = breaksList.find((item) => item.end === null);
        if (recordActiveBreak) {
          recordActiveBreak.end = nowStr;
        }

        record.status = 'Working';
        record.breaks = breaksList;
        await record.save({ session });
      });

      logAudit(employeeId, 'BREAK_END', 'Resumed work', orgId);
      return record;
    } catch (err) {
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async checkOut(reqUser, bodyData) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const employeeId = reqUser.role === 'EMPLOYEE' ? reqUser.id : bodyData.employeeId;
    const { idempotencyKey } = bodyData;

    // 🔐 Idempotency check FIRST
    if (idempotencyKey) {
      const existing = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey });
      if (existing) {
        return existing.response.data;
      }
    }

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        if (idempotencyKey) {
          const existingTx = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey }).session(session);
          if (existingTx) {
            result = existingTx.response;
            return;
          }
        }

        // Enforce lock and find matching record atomically
        const record = await Attendance.findOne({
          employeeId,
          companyId: orgId,
          status: { $ne: 'Checked Out' }
        }).session(session);

        if (!record) {
          throw new Error('Check-out-before-check-in rejection. No active session found.');
        }

        const checkOutTime = new Date().toISOString();

        // Finalize any active BreakSession
        const activeBreak = await BreakSession.findOne({
          attendanceRecordId: record._id,
          companyId: orgId,
          status: 'ACTIVE'
        }).session(session);

        if (activeBreak) {
          activeBreak.endTime = checkOutTime;
          activeBreak.status = 'COMPLETED';
          await activeBreak.save({ session });
        }

        // Finalize breaks array inside record
        const breaksList = Array.isArray(record.breaks) ? [...record.breaks] : [];
        const recordActiveBreak = breaksList.find((item) => item.end === null);
        if (recordActiveBreak) {
          recordActiveBreak.end = checkOutTime;
        }

        record.status = 'Checked Out';
        record.checkOutTime = checkOutTime;
        record.breaks = breaksList;
        await record.save({ session });

        // Create checkout event
        await AttendanceEvent.create([{
          id: Math.random().toString(36).slice(2, 11),
          companyId: orgId,
          employeeId,
          attendanceRecordId: record._id,
          type: 'CHECK_OUT',
          timestamp: checkOutTime
        }], { session });

        result = { success: true, data: record };

        if (idempotencyKey) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await IdempotencyRecord.create([{
            companyId: orgId,
            key: idempotencyKey,
            statusCode: 200,
            response: result,
            expiresAt
          }], { session });
        }
      });

      logAudit(employeeId, 'CHECK_OUT', 'Checked out from active session', orgId);
      return result.data;
    } catch (err) {
      if (idempotencyKey) {
        const committedRecord = await IdempotencyRecord.findOne({ companyId: orgId, key: idempotencyKey });
        if (committedRecord) {
          return committedRecord.response.data;
        }
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async getRecords(reqUser) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const { role, id: employeeId, department, team } = reqUser;
    const query = { companyId: orgId };

    if (role === 'EMPLOYEE') {
      query.employeeId = employeeId;
    } else if (role === 'TEAM_LEAD') {
      query.team = team;
    } else if (role === 'MANAGER') {
      query.department = department;
    }

    return Attendance.find(query);
  }

  async getTodayAttendance(userId, orgId) {
    const todayDate = new Date().toISOString().split('T')[0];
    return Attendance.findOne({ employeeId: userId, date: todayDate, companyId: orgId });
  }

  // Corrections
  async submitCorrection(reqUser, bodyData) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const { role, id: userId } = reqUser;
    const employeeId = role === 'EMPLOYEE' ? userId : bodyData.employeeId;
    const { date, requestedCheckIn, requestedCheckOut, reason } = bodyData;

    if (!employeeId || !date || !requestedCheckIn || !requestedCheckOut || !reason) {
      throw new Error('Complete correction details are required.');
    }

    const identity = await this.findIdentity(employeeId, orgId);
    if (!identity) {
      throw new Error('Employee is outside the active organization.');
    }

    const id = Math.random().toString(36).slice(2, 11);
    const createdAt = new Date().toISOString();

    const correction = await Correction.create({
      id,
      employeeId,
      employeeName: identity.name,
      department: identity.department,
      date,
      requestedCheckIn,
      requestedCheckOut,
      reason,
      status: 'Pending',
      managerComment: null,
      reviewedBy: null,
      createdAt,
      team: identity.team,
      organizationId: orgId,
      companyId: orgId
    });

    logAudit(employeeId, 'CORRECTION_REQUESTED', `Submitted correction request for ${date}`, orgId);
    return { id: correction.id, status: 'Pending' };
  }

  async reviewCorrection(reqUser, correctionId, status, managerComment) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const correction = await Correction.findOne({ id: correctionId, companyId: orgId });
    if (!correction) {
      throw new Error('Correction request not found.');
    }

    if (reqUser.role === 'MANAGER' && correction.department !== reqUser.department) {
      throw new Error('Correction is outside your department.');
    }
    if (reqUser.role === 'TEAM_LEAD' && correction.team !== reqUser.team) {
      throw new Error('Correction is outside your team.');
    }
    if (correction.status !== 'Pending') {
      throw new Error('Correction has already been reviewed.');
    }

    const reviewerName = reqUser.name;
    correction.status = status;
    correction.managerComment = managerComment || '';
    correction.reviewedBy = reviewerName;
    await correction.save();

    if (status === 'Approved') {
      const checkInTime = new Date(`${correction.date}T${correction.requestedCheckIn}`).toISOString();
      const checkOutTime = new Date(`${correction.date}T${correction.requestedCheckOut}`).toISOString();

      const existingRecord = await Attendance.findOne({
        employeeId: correction.employeeId,
        date: correction.date,
        companyId: orgId
      });

      if (existingRecord) {
        existingRecord.checkInTime = checkInTime;
        existingRecord.checkOutTime = checkOutTime;
        existingRecord.status = 'Checked Out';
        await existingRecord.save();
      } else {
        const recordId = Math.random().toString(36).slice(2, 11);
        await Attendance.create({
          id: recordId,
          employeeId: correction.employeeId,
          employeeName: correction.employeeName,
          department: correction.department,
          date: correction.date,
          checkInTime,
          checkOutTime,
          breaks: [],
          shiftType: 'Regular',
          workMode: 'Office',
          status: 'Checked Out',
          team: correction.team,
          organizationId: orgId,
          companyId: orgId
        });
      }
    }

    logAudit(correction.employeeId, `CORRECTION_${status.toUpperCase()}`, `${reviewerName} reviewed correction request`, orgId);
  }

  async getCorrections(reqUser) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const { role, id: employeeId, department, team } = reqUser;
    const query = { companyId: orgId };

    if (role === 'EMPLOYEE') {
      query.employeeId = employeeId;
    } else if (role === 'TEAM_LEAD') {
      query.team = team;
    } else if (role === 'MANAGER') {
      query.department = department;
    }

    return Correction.find(query);
  }

  async getShifts(orgId) {
    return mongoose.model('Shift').find({ companyId: orgId });
  }

  async getAuditLogs(reqUser) {
    const orgId = reqUser.companyId || reqUser.organizationId || 'org-stackly';
    const { role, id: employeeId, department, team } = reqUser;

    let employeeIds = null;
    if (role === 'TEAM_LEAD') {
      const emps = await Employee.find({ team, companyId: orgId }, { id: 1 });
      employeeIds = emps.map((e) => e.id);
    } else if (role === 'MANAGER') {
      const emps = await Employee.find({ department, companyId: orgId }, { id: 1 });
      employeeIds = emps.map((e) => e.id);
    }

    const query = { companyId: orgId };
    if (role === 'EMPLOYEE') {
      query.employeeId = employeeId;
    } else if (employeeIds) {
      query.employeeId = { $in: employeeIds };
    }

    return AuditLog.find(query);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
