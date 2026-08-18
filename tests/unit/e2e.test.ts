import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { app } from '../../server.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { Attendance, Correction, BreakSession, AttendanceEvent, IdempotencyRecord } from '../../backend/src/models/Attendance.js';
import { User } from '../../backend/src/models/User.js';
import jwt from 'jsonwebtoken';
import { env } from '../../backend/src/config/env.js';

let server: any;
const PORT = 5098;

const mongoose = {
  startSession: async () => ({
    withTransaction: async (fn: () => Promise<void>) => {
      const db = getDb();
      db.prepare('BEGIN TRANSACTION').run();
      try {
        await fn();
        db.prepare('COMMIT').run();
      } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
      }
    },
    endSession: async () => {}
  })
};
const client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

beforeAll(async () => {
  await initDb();
  await Attendance.deleteMany({});
  await Correction.deleteMany({});
  await BreakSession.deleteMany({});
  await AttendanceEvent.deleteMany({});
  await IdempotencyRecord.deleteMany({});
  return new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });
}, 30000);

afterAll(async () => {
  const db = getDb();
  if (db) {
    db.close();
  }
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}, 30000);

describe('E2E User Flow Tests', () => {
  let token = '';
  const employeeInfo = {
    employeeId: 'usr-emp-01',
    employeeName: 'Alex Mercer',
    department: 'Engineering',
    shiftType: 'Regular',
    workMode: 'Remote',
    idempotencyKey: `e2e-idemp-${Date.now()}`
  };

  it('Flow: Login -> Check-In -> Break -> Resume -> Check-Out -> View History', async () => {
    // 1. Login
    const loginRes = await client.post('/v1/auth/login', { email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    expect(loginRes.status).toBe(200);
    // Since MFA is enabled, we get challengeId and code
    expect(loginRes.data.data.requiresMfa).toBe(true);
    const { challengeId, otpDevHint } = loginRes.data.data;

    // MFA Verify
    const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
    expect(verifyRes.status).toBe(200);
    token = verifyRes.data.data.token;
    expect(token).toBeDefined();

    // 2. Check-In
    const checkInRes = await client.post('/v1/attendance/check-in', employeeInfo, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(checkInRes.status).toBe(200);
    expect(checkInRes.data.data.status).toBe('Checked In');

    // 3. Take Break
    const breakRes = await client.post('/v1/attendance/break', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(breakRes.status).toBe(200);

    // 4. Resume
    const resumeRes = await client.post('/v1/attendance/resume', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(resumeRes.status).toBe(200);

    // 5. Check-Out
    const checkOutRes = await client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(checkOutRes.status).toBe(200);

    // 6. View History
    const historyRes = await client.get('/v1/attendance/records', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(historyRes.status).toBe(200);
    expect(historyRes.data.data.length).toBeGreaterThan(0);
    const selfRecord = historyRes.data.data.find((r: any) => r.employeeId === 'usr-emp-01');
    expect(selfRecord).toBeDefined();
    expect(selfRecord.status).toBe('Checked Out');
  });

  it('should enforce geofence, duplicate check-in, and double-checkout restrictions', async () => {
    // 1. Login to get token
    const loginRes = await client.post('/v1/auth/login', { email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    const { challengeId, otpDevHint } = loginRes.data.data;
    const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
    const empToken = verifyRes.data.data.token;

    // 2. Try check-in with out-of-bounds geofence
    const badGeofenceInfo = {
      employeeId: 'usr-emp-01',
      employeeName: 'Alex Mercer',
      department: 'Engineering',
      shiftType: 'Regular',
      workMode: 'Office',
      latitude: 0,
      longitude: 0,
      accuracy: 10,
      idempotencyKey: `e2e-badgeo-${Date.now()}`
    };
    const badGeoRes = await client.post('/v1/attendance/check-in', badGeofenceInfo, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(badGeoRes.status).toBe(400);
    expect(badGeoRes.data.message).toContain('Geofencing validation failed');

    // 3. Perform a valid check-in
    const validInfo = {
      employeeId: 'usr-emp-01',
      employeeName: 'Alex Mercer',
      department: 'Engineering',
      shiftType: 'Regular',
      workMode: 'Remote',
      idempotencyKey: `e2e-valid-${Date.now()}`
    };
    const goodCheckInRes = await client.post('/v1/attendance/check-in', validInfo, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(goodCheckInRes.status).toBe(200);

    // 4. Try duplicate check-in (should reject with 400)
    const duplicateCheckInRes = await client.post('/v1/attendance/check-in', {
      ...validInfo,
      idempotencyKey: `e2e-dup-${Date.now()}`
    }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(duplicateCheckInRes.status).toBe(400);
    expect(duplicateCheckInRes.data.message).toContain('Active session already exists');

    // 5. Perform valid check-out
    const checkOutRes1 = await client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(checkOutRes1.status).toBe(200);

    // 6. Try duplicate check-out (should reject with 400 because there is no active session)
    const checkOutRes2 = await client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(checkOutRes2.status).toBe(400);
    expect(checkOutRes2.data.message).toContain('No active session found');
  });

  it('should verify Checkout before check-in rejects and writes nothing', async () => {
    const loginRes = await client.post('/v1/auth/login', { email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    const { challengeId, otpDevHint } = loginRes.data.data;
    const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
    const empToken = verifyRes.data.data.token;

    // Verify event count before and after invalid checkout attempt
    const countBefore = await AttendanceEvent.countDocuments({ employeeId: 'usr-emp-01', type: 'CHECK_OUT' });

    const res = await client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01' }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    expect(res.status).toBe(400);

    const countAfter = await AttendanceEvent.countDocuments({ employeeId: 'usr-emp-01', type: 'CHECK_OUT' });
    expect(countAfter).toBe(countBefore);
  });

  it('should enforce Cross-company protection', async () => {
    // 1. Create Company A and Company B user records
    const userA = {
      id: 'usr-comp-A',
      name: 'User Company A',
      email: 'usera@comp-a.com',
      role: 'EMPLOYEE',
      companyId: 'org-A',
      organizationId: 'org-A'
    };
    const userB = {
      id: 'usr-comp-B',
      name: 'User Company B',
      email: 'userb@comp-b.com',
      role: 'EMPLOYEE',
      companyId: 'org-B',
      organizationId: 'org-B'
    };

    // Pre-populate an active Attendance record for User B in Company B
    const recordB = await Attendance.create({
      id: 'record-B',
      employeeId: userB.id,
      employeeName: userB.name,
      date: '2026-08-18',
      checkInTime: new Date().toISOString(),
      status: 'Checked In',
      companyId: 'org-B',
      organizationId: 'org-B'
    });

    // Generate sign-in token for User A under Company A
    const tokenA = jwt.sign(userA, env.JWT_SECRET);

    // User A tries to check out User B
    const res = await client.post('/v1/attendance/check-out', { employeeId: userB.id }, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    // Should fail (either 400 not found or 403 cross-org)
    expect(res.status).toBeGreaterThanOrEqual(400);

    // Verify User B attendance record remains intact and still Checked In
    const updatedRecordB = await Attendance.findById(recordB._id);
    expect(updatedRecordB.status).toBe('Checked In');
  });

  it('should support Concurrent Checkout with duplicate replay', async () => {
    const loginRes = await client.post('/v1/auth/login', { email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    const { challengeId, otpDevHint } = loginRes.data.data;
    const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
    const empToken = verifyRes.data.data.token;

    // Check in first
    const key = `check-out-key-${Date.now()}`;
    await client.post('/v1/attendance/check-in', {
      employeeId: 'usr-emp-01',
      shiftType: 'Regular',
      workMode: 'Remote',
      idempotencyKey: `check-in-key-${Date.now()}`
    }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });

    // Send two checkout requests simultaneously
    const p1 = client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01', idempotencyKey: key }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const p2 = client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01', idempotencyKey: key }, {
      headers: { Authorization: `Bearer ${empToken}` }
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);

    // Verify only 1 CHECK_OUT event is recorded
    const eventCount = await AttendanceEvent.countDocuments({
      employeeId: 'usr-emp-01',
      type: 'CHECK_OUT'
    });
    // Total Check Out events for this employee should be exactly 3 (one from the first test, one from the second test, and one from this concurrent test)
    expect(eventCount).toBe(3);
  });

  it('should verify Transaction Rollback on failure', async () => {
    const orgId = 'org-stackly';
    const employeeId = 'usr-emp-01';

    // Verify starting session and manual rollback
    const record = await Attendance.create({
      id: 'rollback-record-id',
      employeeId,
      date: '2026-08-18',
      checkInTime: new Date().toISOString(),
      status: 'Checked In',
      companyId: orgId,
      organizationId: orgId
    });

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Perform modification
        await Attendance.updateOne(
          { _id: record._id },
          { $set: { status: 'Checked Out' } }
        ).session(session);

        // Force throw an error to trigger rollback
        throw new Error('FORCE_ROLLBACK');
      });
    } catch (err) {
      expect(err.message).toBe('FORCE_ROLLBACK');
    } finally {
      await session.endSession();
    }

    // Verify record state rolled back and remains 'Checked In'
    const fetchedRecord = await Attendance.findById(record._id);
    expect(fetchedRecord.status).toBe('Checked In');
  });
});
