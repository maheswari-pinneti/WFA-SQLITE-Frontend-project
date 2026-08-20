import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { app } from '../../server.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { Attendance, Correction } from '../../backend/src/models/Attendance.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.ts';

let server: any;
const PORT = 5099;
const client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

beforeAll(async () => {
  await seedSqlite();
  await initDb();
  await Attendance.deleteMany({});
  await Correction.deleteMany({});
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

describe('Workforce Analytics API Integration & Authorization Tests', () => {
  let adminToken = '';
  let employeeToken = '';
  let managerToken = '';
  let teamLeadToken = '';

  const loginToken = async (email: string) => {
    const loginRes = await client.post('/v1/auth/login', { email, password: 'StacklyWFA2026!' });
    const verifyRes = await client.post('/v1/auth/mfa/verify', {
      challengeId: loginRes.data.data.challengeId,
      otp: loginRes.data.data.otpDevHint
    });
    return verifyRes.data.data.token as string;
  };

  it('should fail login with invalid domain', async () => {
    const res = await client.post('/v1/auth/login', { email: 'bad@gmail.com', password: 'StacklyWFA2026!' });
    expect(res.status).toBe(403);
    expect(res.data.success).toBe(false);
  });

  it('should authenticate admin successfully', async () => {
    const res = await client.post('/v1/auth/login', { email: 'admin@thestackly.com', password: 'StacklyWFA2026!' });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.requiresMfa).toBe(true);
    
    // MFA Verification step
    const mfaRes = await client.post('/v1/auth/mfa/verify', {
      challengeId: res.data.data.challengeId,
      otp: res.data.data.otpDevHint
    });
    expect(mfaRes.status).toBe(200);
    expect(mfaRes.data.data.token).toBeDefined();
    adminToken = mfaRes.data.data.token;
  });

  it('should authenticate employee successfully', async () => {
    const res = await client.post('/v1/auth/login', { email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.requiresMfa).toBe(true);

    // MFA Verification step
    const mfaRes = await client.post('/v1/auth/mfa/verify', {
      challengeId: res.data.data.challengeId,
      otp: res.data.data.otpDevHint
    });
    expect(mfaRes.status).toBe(200);
    employeeToken = mfaRes.data.data.token;
  });

  it('should authenticate department and team scopes', async () => {
    managerToken = await loginToken('manager@thestackly.com');
    teamLeadToken = await loginToken('lead@thestackly.com');
    expect(managerToken).toBeDefined();
    expect(teamLeadToken).toBeDefined();
  });

  it('should fetch analytics with valid token', async () => {
    const res = await client.get('/v1/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.metrics).toBeDefined();
  });

  it('should reject analytics fetch without token', async () => {
    const res = await client.get('/v1/analytics');
    expect(res.status).toBe(401);
  });

  // Automated Authentication Flows Tests
  describe('Automated Authentication Flows', () => {
    it('GET /health → 200', async () => {
      const res = await client.get('/v1/health');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.status).toBe('healthy');
    });

    it('POST /auth/login → invalid password → 401', async () => {
      const res = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'WrongPassword123'
      });
      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
    });

    it('POST /auth/login → valid password + MFA → challenge created', async () => {
      const res = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.requiresMfa).toBe(true);
      expect(res.data.data.challengeId).toBeDefined();
    });

    it('POST /auth/mfa/verify → invalid OTP → 400/401', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;

      const verifyRes = await client.post('/v1/auth/mfa/verify', {
        challengeId,
        otp: '000000'
      });
      expect(verifyRes.status).toBe(400);
      expect(verifyRes.data.success).toBe(false);
    });

    it('POST /auth/mfa/resend → new challenge', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;

      const resendRes = await client.post('/v1/auth/mfa/resend', {
        challengeId
      });
      expect(resendRes.status).toBe(200);
      expect(resendRes.data.success).toBe(true);
      expect(resendRes.data.data.challengeId).toBe(challengeId);
      expect(resendRes.data.data.expiresAt).toBeDefined();
    });

    it('POST /auth/mfa/verify → valid OTP → authentication success', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;
      const otp = loginRes.data.data.otpDevHint;

      const verifyRes = await client.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.data.success).toBe(true);
      expect(verifyRes.data.data.token).toBeDefined();
      expect(verifyRes.data.data.refreshToken).toBeDefined();
    });

    it('POST /auth/refresh → valid session → new access token', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;
      const otp = loginRes.data.data.otpDevHint;

      const verifyRes = await client.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      const refreshToken = verifyRes.data.data.refreshToken;

      const refreshRes = await client.post('/v1/auth/refresh', {
        refreshToken
      });
      expect(refreshRes.status).toBe(200);
      expect(refreshRes.data.success).toBe(true);
      expect(refreshRes.data.data.token).toBeDefined();
    });

    it('GET /auth/me → authenticated user', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;
      const otp = loginRes.data.data.otpDevHint;

      const verifyRes = await client.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      const token = verifyRes.data.data.token;

      const meRes = await client.get('/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(meRes.status).toBe(200);
      expect(meRes.data.success).toBe(true);
      expect(meRes.data.data.email).toBe('employee@thestackly.com');
    });

    it('POST /auth/logout → success', async () => {
      const loginRes = await client.post('/v1/auth/login', {
        email: 'employee@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      const challengeId = loginRes.data.data.challengeId;
      const otp = loginRes.data.data.otpDevHint;

      const verifyRes = await client.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      const token = verifyRes.data.data.token;
      const refreshToken = verifyRes.data.data.refreshToken;

      const logoutRes = await client.post('/v1/auth/logout', {
        refreshToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data.success).toBe(true);
    });
  });

  it('should reject user list for non-admin employee', async () => {
    const res = await client.get('/v1/users', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    expect(res.status).toBe(403);
  });

  it('should fetch users list for admin', async () => {
    const res = await client.get('/v1/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
  });

  it('should restrict employees to self-level attendance records', async () => {
    const denied = await client.post('/v1/attendance/check-in', {
      employeeId: 'emp-2', employeeName: 'Other Employee', department: 'Product Management',
      shiftType: 'Regular', workMode: 'Remote', idempotencyKey: `scope-denied-${Date.now()}`
    }, { headers: { Authorization: `Bearer ${employeeToken}` } });
    expect(denied.status).toBe(403);

    const history = await client.get('/v1/attendance/records', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    expect(history.status).toBe(200);
    expect(history.data.data.every((record: any) => record.employeeId === 'usr-emp-01')).toBe(true);
  });

  it('should enforce department and team scopes server-side', async () => {
    const managerEmployees = await client.get('/v1/employees', { headers: { Authorization: `Bearer ${managerToken}` } });
    expect(managerEmployees.status).toBe(200);
    expect(managerEmployees.data.data.employees.every((employee: any) => employee.department === 'Engineering')).toBe(true);

    const teamEmployees = await client.get('/v1/employees', { headers: { Authorization: `Bearer ${teamLeadToken}` } });
    expect(teamEmployees.status).toBe(200);
    expect(teamEmployees.data.data.employees.every((employee: any) => employee.team === 'Frontend Team')).toBe(true);

    const crossDepartment = await client.get('/v1/attendance/records?employeeId=emp-2', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    expect(crossDepartment.status).toBe(403);
  });

  it('should persist and scope leave requests and tasks', async () => {
    const leave = await client.post('/v1/leave-requests', {
      type: 'Annual Leave', startDate: '2026-09-10', endDate: '2026-09-12', reason: 'Integration test request'
    }, { headers: { Authorization: `Bearer ${employeeToken}` } });
    expect(leave.status).toBe(201);
    expect(leave.data.data.status).toBe('PENDING');

    const ownRequests = await client.get('/v1/leave-requests', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    expect(ownRequests.status).toBe(200);
    expect(ownRequests.data.data.some((request: any) => request.id === leave.data.data.id)).toBe(true);

    const managerRequests = await client.get('/v1/leave-requests', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    expect(managerRequests.status).toBe(200);
    expect(managerRequests.data.data.every((request: any) => request.department === 'Engineering')).toBe(true);

    const reviewed = await client.put(`/v1/leave-requests/${leave.data.data.id}`, {
      status: 'APPROVED', reviewComment: 'Approved by integration test'
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    expect(reviewed.status).toBe(200);
    expect(reviewed.data.data.status).toBe('APPROVED');

    const managerTasks = await client.get('/v1/tasks', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    expect(managerTasks.status).toBe(200);
    expect(managerTasks.data.data.every((task: any) => task.department === 'Engineering')).toBe(true);

    const teamTasks = await client.get('/v1/tasks', {
      headers: { Authorization: `Bearer ${teamLeadToken}` }
    });
    expect(teamTasks.status).toBe(200);
    expect(teamTasks.data.data.every((task: any) => task.team === 'Frontend Team')).toBe(true);
  });

  it('should reject cross-organization query attempts', async () => {
    const res = await client.get('/v1/analytics?organizationId=other-org', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    expect(res.status).toBe(403);
  });

  it('should support pagination, sorting, search, and filtering in the employee directory', async () => {
    // 1. Default numeric sorting & pagination limit of 25
    const page1 = await client.get('/v1/employees?page=1&pageSize=25', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(page1.status).toBe(200);
    expect(page1.data.data.employees.length).toBe(25);
    expect(page1.data.data.pagination.page).toBe(1);
    expect(page1.data.data.pagination.pageSize).toBe(25);
    expect(page1.data.data.pagination.totalItems).toBe(500);
    expect(page1.data.data.pagination.totalPages).toBe(20);
    
    // Default order should be numerical sequence EMP-001 to EMP-025
    expect(page1.data.data.employees[0].employeeCode).toContain('-001');
    expect(page1.data.data.employees[24].employeeCode).toContain('-025');

    // 2. Fetch page 2 and confirm correct offset boundaries (EMP-026 to EMP-050)
    const page2 = await client.get('/v1/employees?page=2&pageSize=25', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(page2.status).toBe(200);
    expect(page2.data.data.employees.length).toBe(25);
    expect(page2.data.data.employees[0].employeeCode).toContain('-026');
    expect(page2.data.data.employees[24].employeeCode).toContain('-050');

    // 3. Search filter by Employee ID
    const searchId = await client.get('/v1/employees?search=007', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(searchId.status).toBe(200);
    expect(searchId.data.data.employees.length).toBe(1);
    expect(searchId.data.data.employees[0].employeeCode).toContain('-007');

    // 4. Filter by Location
    const filterLoc = await client.get('/v1/employees?location=Bengaluru&pageSize=250', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(filterLoc.status).toBe(200);
    expect(filterLoc.data.data.employees.every((e: any) => e.location === 'Bengaluru')).toBe(true);

    // 5. Multi-criteria filtering (Location, Status, Department)
    const multiFilter = await client.get('/v1/employees?location=Bengaluru&status=ACTIVE&department=Engineering&pageSize=250', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(multiFilter.status).toBe(200);
    expect(multiFilter.data.data.employees.every((e: any) => e.location === 'Bengaluru' && e.status.toUpperCase() === 'ACTIVE' && e.department === 'Engineering')).toBe(true);

    // 6. Filter by Joining Year
    const yearFilter = await client.get('/v1/employees?joiningYear=2021&pageSize=250', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(yearFilter.status).toBe(200);
    expect(yearFilter.data.data.employees.every((e: any) => e.joinDate.startsWith('2021-'))).toBe(true);
  });

  describe('Database Schema, FK, and Seeding integrity', () => {
    it('should verify schema collections exist', async () => {
      const tables = getDb().prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
      const tableNames = tables.map(t => t.name.toLowerCase());
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('employees');
      expect(tableNames).toContain('mfachallenges');
      expect(tableNames).toContain('sessions');
      expect(tableNames).toContain('refreshtokens');
    });

    it('should verify seeder loaded the deterministic admin and employee structures', async () => {
      const { User } = await import('../../backend/src/models/User.js');
      const count = await User.countDocuments({});
      expect(count).toBeGreaterThanOrEqual(5); // Admin, HR, Manager, Lead, Employee
    });

    it('should enforce Unique constraint checks (validation)', async () => {
      const { User } = await import('../../backend/src/models/User.js');
      try {
        await User.create({
          id: 'duplicate-user-id',
          name: 'Arthur Pendelton',
          email: 'admin@thestackly.com',
          password_hash: 'hash',
          role: 'ADMIN'
        });
        throw new Error('Should have thrown unique constraint error');
      } catch (insertErr: any) {
        expect(insertErr).toBeDefined();
        expect(insertErr.code).toBe(11000); // Duplicate key code
      }
    });
  });
});
