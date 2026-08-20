# Code-to-Requirement Traceability & Verification Matrix

This matrix establishes the compliance link between business requirements, code files, API routes, database constraints, and validation results.

---

## 1. Code-Level Implementation Mapping

### Core Authentication & Session Verification
* **Requirement**: JWT Verification, Expiry & Rate Limiting
* **Frontend Component**: Router guard checking session context.
* **API Route / Path**: `POST /v1/auth/login`, `POST /v1/auth/mfa/verify`
* **Controller**: `auth.controller.ts`
* **Middleware**: `auth.js` (JWT checks) & `resilience.js` (Rate limiting, lockout bounds)
* **Test Case**: `tests/unit/auth.test.ts` $\rightarrow$ PASS

### Employee Check-In & State Transitions
* **Requirement**: Geofence checks, Duplicate Check-in Prevention, Valid Punch transitions
* **Frontend Component**: Check-in widget on Dashboard
* **API Route / Path**: `POST /v1/attendance/check-in`, `POST /v1/attendance/check-out`
* **Controller**: `attendance.controller.js`
* **Service**: `attendance.service.ts`
* **Database Constraint**: Composite indexes on `(employeeId, createdAt)`
* **Test Case**: `tests/unit/attendance.test.ts` $\rightarrow$ PASS

### Data Minimization & Privileged Registration Block
* **Requirement**: Prevent privilege escalation during registration
* **API Route / Path**: `POST /v1/auth/register`
* **Middleware**: Role validation mapping in auth controller
* **Database Constraint**: Default role constraints in `employees` schema
* **Test Case**: `tests/unit/e2e.test.ts` $\rightarrow$ PASS

---

## 2. SQLite Database Reliability Traceability

| Target Setting / Check | Code File / Route | PRAGMA Statement / Index Name | Verification Test / Run Script | Status |
| --- | --- | --- | --- | --- |
| **Journal Mode (WAL)** | `sqlite-cloud.ts` | `PRAGMA journal_mode = WAL;` | `npm run verify-db` | **PASS** |
| **Integrity Validation** | `sqlite-cloud.ts` | `PRAGMA integrity_check;` | `npm run db:validate` | **PASS** |
| **Query Index Optimization** | `schema.sql` | `idx_attendancerecords_emp_date` | `npm run db:explain` | **PASS** |
| **Automated Backups** | `backup-db.ts` | Online Backup API | `npm run db:backup` | **PASS** |
| **Restore Recovery Cycle** | `restore-db.ts` | Backup restoring script | `npm run db:restore` | **PASS** |

---

## 3. Production Code Hygiene Verification
- **Secrets Management**: Verified that `.env` is omitted from Git (checked `.gitignore`).
- **Development URLs**: All environment API connections resolve relative path mappings in Vite production bundles.
- **Dependency Audit**: Verified clean output of `npm audit` for supply-chain integrity checks.
