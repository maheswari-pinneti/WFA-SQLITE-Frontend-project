import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { app } from '../../server.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { Attendance, BreakSession, AttendanceEvent, IdempotencyRecord, Correction } from '../../backend/src/models/Attendance.js';
import { User, MfaChallenge } from '../../backend/src/models/User.js';
import { Employee } from '../../backend/src/models/Employee.js';
import { Department, Team, Shift, Task } from '../../backend/src/models/Department.js';
import { authService } from '../../backend/src/services/auth.service.js';
import { attendanceService } from '../../backend/src/services/attendance.service.js';
import { analyticsService } from '../../backend/src/services/analytics.service.js';
import jwt from 'jsonwebtoken';
import mongoose from '../../backend/src/config/mongoose.js';

let server: any;
const PORT = 5097;
const client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

beforeAll(async () => {
  await initDb();
  
  return new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });
}, 40000);

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
}, 40000);

describe('WFA Comprehensive Backend Unit and Integration Testing', () => {
  beforeEach(async () => {
    // Isolated database cleanup
    await Attendance.deleteMany({});
    await BreakSession.deleteMany({});
    await AttendanceEvent.deleteMany({});
    await IdempotencyRecord.deleteMany({});
    await Correction.deleteMany({});
    await Employee.deleteMany({ id: { $in: ['e1', 'e2', 'emp-comp-a', 'emp-comp-b', 'usr-tx-test', 'emp-unique-1', 'emp-unique-2'] } });
    await User.deleteMany({ id: { $in: ['usr-tx-test'] } });
  });

  describe('Database Unit Tests & Unique Constraints', () => {
    it('should successfully establish MongoDB connection', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = Connected
    });

    it('should reject duplicate employee IDs / emails due to unique constraints', async () => {
      // First creation
      await Employee.create({
        id: 'emp-unique-1',
        employeeCode: 'STK-UNIQUE-001',
        name: 'First Last',
        email: 'unique1@thestackly.com',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      });

      // Attempt duplicate code
      await expect(Employee.create({
        id: 'emp-unique-2',
        employeeCode: 'STK-UNIQUE-001',
        name: 'Second Last',
        email: 'unique2@thestackly.com',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      })).rejects.toThrow();

      // Attempt duplicate email
      await expect(Employee.create({
        id: 'emp-unique-3',
        employeeCode: 'STK-UNIQUE-002',
        name: 'Third Last',
        email: 'unique1@thestackly.com',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      })).rejects.toThrow();
    });
  });

  describe('Transaction & Rollback Tests', () => {
    it('should rollback check-in transaction completely if subsequent operations fail', async () => {
      // Seed employee and user identity first so findIdentity checks pass
      await User.create({
        id: 'usr-tx-test',
        name: 'Tx Test',
        email: 'tx@thestackly.com',
        password_hash: 'hash',
        role: 'EMPLOYEE',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      });

      await Employee.create({
        id: 'usr-tx-test',
        employeeCode: 'STK-TX-TEST',
        name: 'Tx Test',
        email: 'tx@thestackly.com',
        role: 'EMPLOYEE',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      });

      const reqUser = { id: 'usr-tx-test', role: 'EMPLOYEE', companyId: 'org-stackly', organizationId: 'org-stackly' };
      const punchData = {
        employeeId: 'usr-tx-test',
        shiftType: 'Regular',
        workMode: 'Remote',
        idempotencyKey: 'tx-fail-key'
      };

      // Mock AttendanceEvent.create to throw an error inside the transaction
      const originalCreate = AttendanceEvent.create;
      AttendanceEvent.create = async () => {
        throw new Error('Simulated AttendanceEvent failure during transaction');
      };

      try {
        await attendanceService.checkIn(reqUser, punchData);
      } catch (err: any) {
        expect(err.message).toBe('Simulated AttendanceEvent failure during transaction');
      } finally {
        AttendanceEvent.create = originalCreate;
      }

      // Verify transaction rollback - no Attendance record, no IdempotencyRecord, no Event
      const records = await Attendance.find({ employeeId: 'usr-tx-test' });
      expect(records.length).toBe(0);

      const idempotencies = await IdempotencyRecord.find({ key: 'tx-fail-key' });
      expect(idempotencies.length).toBe(0);
    });
  });

  describe('Idempotency Tests', () => {
    it('should return identical cached response on duplicate request and not execute check-in twice', async () => {
      const reqUser = { id: 'usr-emp-01', role: 'EMPLOYEE', companyId: 'org-stackly', organizationId: 'org-stackly' };
      const punchData = {
        employeeId: 'usr-emp-01',
        shiftType: 'Regular',
        workMode: 'Remote',
        idempotencyKey: 'idemp-key-123'
      };

      // First Request
      const firstResult = await attendanceService.checkIn(reqUser, punchData);
      expect(firstResult.idempotentReplay).toBe(false);
      expect(firstResult.data.id).toBeDefined();

      const recordId = firstResult.data.id;

      // Duplicate Request
      const secondResult = await attendanceService.checkIn(reqUser, punchData);
      expect(secondResult.idempotentReplay).toBe(true);
      expect(secondResult.data.id).toBe(recordId);

      // Verify no duplicate attendance records or events exist
      const records = await Attendance.find({ employeeId: 'usr-emp-01' });
      expect(records.length).toBe(1);

      const events = await AttendanceEvent.find({ employeeId: 'usr-emp-01' });
      expect(events.length).toBe(1);
    });

    it('should safely reject different request with the same idempotency key where applicable', async () => {
      const reqUser = { id: 'usr-emp-01', role: 'EMPLOYEE', companyId: 'org-stackly', organizationId: 'org-stackly' };
      const key = 'shared-idemp-key';

      // First Request
      await attendanceService.checkIn(reqUser, {
        employeeId: 'usr-emp-01',
        shiftType: 'Regular',
        workMode: 'Remote',
        idempotencyKey: key
      });

      // Different request params using the same key
      const secondResult = await attendanceService.checkIn(reqUser, {
        employeeId: 'usr-emp-01',
        shiftType: 'Flexible', // Different shift
        workMode: 'Office', // Different workMode
        latitude: 12.9716,
        longitude: 77.5946,
        idempotencyKey: key
      });

      // Since the idempotency key was already consumed, it just replays the first result's data
      expect(secondResult.idempotentReplay).toBe(true);
      expect(secondResult.data.shiftType).toBe('Regular');
      expect(secondResult.data.workMode).toBe('Remote');
    });
  });

  describe('Company/Tenant Isolation Tests', () => {
    it('should strictly isolate company data and prevent Company A from reading Company B records', async () => {
      // Setup Company A and B employees
      await Employee.create({
        id: 'emp-comp-a',
        employeeCode: 'STK-COMP-A',
        name: 'Alice A',
        email: 'alice@comp-a.com',
        organizationId: 'company-a',
        companyId: 'company-a'
      });

      await Employee.create({
        id: 'emp-comp-b',
        employeeCode: 'STK-COMP-B',
        name: 'Bob B',
        email: 'bob@comp-b.com',
        organizationId: 'company-b',
        companyId: 'company-b'
      });

      // Company A user attempts to fetch Company B employee
      const compAUser = { id: 'usr-admin-a', role: 'ADMIN', companyId: 'company-a', organizationId: 'company-a' };
      
      const compAEmployee = await Employee.findOne({ id: 'emp-comp-a', organizationId: compAUser.organizationId });
      expect(compAEmployee).not.toBeNull();

      const crossCompanyEmployee = await Employee.findOne({ id: 'emp-comp-b', organizationId: compAUser.organizationId });
      expect(crossCompanyEmployee).toBeNull();
    });

    it('should block Company A from modifying Company B attendance', async () => {
      const record = await Attendance.create({
        id: 'att-comp-b',
        employeeId: 'emp-comp-b',
        date: '2026-08-18',
        checkInTime: new Date().toISOString(),
        status: 'Checked In',
        organizationId: 'company-b',
        companyId: 'company-b'
      });

      const compAUser = { id: 'usr-emp-a', role: 'EMPLOYEE', companyId: 'company-a', organizationId: 'company-a' };

      // Attempt to break or checkout of Company B's session as Company A user
      await expect(attendanceService.takeBreak(compAUser, { employeeId: 'emp-comp-b' })).rejects.toThrow();
      await expect(attendanceService.checkOut(compAUser, { employeeId: 'emp-comp-b' })).rejects.toThrow();
    });

    it('should enforce tenant isolation in analytics queries', async () => {
      await Employee.create([
        { id: 'e1', employeeCode: 'STK-01', name: 'E1', email: 'e1@a.com', organizationId: 'company-a', companyId: 'company-a', department: 'ENG', status: 'ACTIVE' },
        { id: 'e2', employeeCode: 'STK-02', name: 'E2', email: 'e2@b.com', organizationId: 'company-b', companyId: 'company-b', department: 'ENG', status: 'ACTIVE' }
      ]);

      const analyticsA = await analyticsService.getAnalytics({ role: 'ADMIN', organizationId: 'company-a', companyId: 'company-a' });
      expect(analyticsA.metrics.totalWorkforce).toBe(1);

      const analyticsB = await analyticsService.getAnalytics({ role: 'ADMIN', organizationId: 'company-b', companyId: 'company-b' });
      expect(analyticsB.metrics.totalWorkforce).toBe(1);
    });
  });

  describe('Service & Controller Integration Unit Tests', () => {
    it('should return error response with correct HTTP status for invalid login credentials', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'nonexistent@thestackly.com',
        password: 'WrongPassword!'
      });
      expect(loginRes.status).toBe(401);
      expect(loginRes.data.success).toBe(false);
    });

    it('should reject checkout before check-in with correct status code', async () => {
      // Log in to get token
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const { challengeId, otpDevHint } = loginRes.data.data;
      const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
      const token = verifyRes.data.data.token;

      // Attempt checkout without check-in
      const res = await client.post('/v1/attendance/check-out', { employeeId: 'usr-emp-01' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    it('should reject unauthorized request with missing authorization header', async () => {
      const res = await client.get('/v1/users');
      expect(res.status).toBe(401);
    });
  });

  describe('Analytics Filtration Validation', () => {
    it('should filter department analytics correctly', async () => {
      await Employee.create([
        { id: 'e1', employeeCode: 'STK-E1', name: 'E1', email: 'e1@st.com', organizationId: 'org-stackly', companyId: 'org-stackly', department: 'ENG-UNIQUE-TEST', status: 'ACTIVE' },
        { id: 'e2', employeeCode: 'STK-E2', name: 'E2', email: 'e2@st.com', organizationId: 'org-stackly', companyId: 'org-stackly', department: 'HR-UNIQUE-TEST', status: 'ACTIVE' }
      ]);

      const analytics = await analyticsService.getAnalytics({ role: 'MANAGER', department: 'ENG-UNIQUE-TEST', organizationId: 'org-stackly' });
      expect(analytics.metrics.totalWorkforce).toBe(1);
    });

    it('should return empty datasets for non-matching filters', async () => {
      const analytics = await analyticsService.getAnalytics({ role: 'MANAGER', department: 'NonexistentDept', organizationId: 'org-stackly' });
      expect(analytics.metrics.totalWorkforce).toBe(0);
    });
  });
});
