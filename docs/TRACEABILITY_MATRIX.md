# Requirements Traceability & Verification Matrix

This matrix establishes the compliance link between business requirements, SQLite operations parameters, validation test cases, and execution evidence.

---

## 1. Traceability Mapping Matrix

| Req ID | Requirement Description | Test Case ID | Verification Method / Command | Evidence Location / Result | Status |
| --- | --- | --- | --- | --- | --- |
| **REQ-DB-001** | Persistent layer must use SQLite only. | `TEST-DB-001` | `npm run verify-db` | Console: "DatabaseType: SQLite" | **PASS** |
| **REQ-DB-002** | Enable Write-Ahead Logging (WAL) mode. | `TEST-DB-002` | `PRAGMA journal_mode;` check | `verify-sqlite.js` $\rightarrow$ `wal` | **PASS** |
| **REQ-DB-003** | Auto-enforce SQLite foreign keys constraints. | `TEST-DB-003` | `PRAGMA foreign_keys;` check | `verify-sqlite.js` $\rightarrow$ `1` (Enabled) | **PASS** |
| **REQ-DB-004** | Enforce index optimization on filtering paths. | `TEST-DB-004` | `EXPLAIN QUERY PLAN` | Master index presence audit | **PASS** |
| **REQ-SEED-01**| Seed exactly 500 employee records deterministically. | `TEST-SEED-01`| `npm run seed` $\rightarrow$ count query | `verify-dataset.ts` $\rightarrow$ `500` | **PASS** |
| **REQ-SEED-02**| Distribute Bengaluru employees exactly to 250 (50%).| `TEST-SEED-02`| Location GROUP BY query | `verify-dataset.ts` $\rightarrow$ `250` | **PASS** |
| **REQ-SEED-03**| Distribute Hyderabad employees exactly to 150 (30%).| `TEST-SEED-03`| Location GROUP BY query | `verify-dataset.ts` $\rightarrow$ `150` | **PASS** |
| **REQ-SEED-04**| Distribute Salem employees exactly to 100 (20%). | `TEST-SEED-04`| Location GROUP BY query | `verify-dataset.ts` $\rightarrow$ `100` | **PASS** |
| **REQ-SEC-001**| Reject non-corporate logins & block brute-force. | `TEST-SEC-001`| Fail 5 logins consecutively | Account locked status `423` | **PASS** |
| **REQ-SEC-002**| Prevent privileged registration (ADMIN/HR) self-signups. | `TEST-SEC-002`| Register with role = `ADMIN` | HTTP status code `403` | **PASS** |
| **REQ-LOAD-01**| Expected peak operations load up to 250 users. | `TEST-LOAD-01`| `npx tsx tests/load/loadTest.js` | 2,250 successful calls, 0 errors | **PASS** |
| **REQ-OPS-001**| Online Hot Database Backup execution. | `TEST-OPS-001`| `npm run db:backup` | Backups dir: `wfa-backup-*.sqlite` | **PASS** |
| **REQ-OPS-002**| Direct Recovery/Restore validation check. | `TEST-OPS-002`| `npm run db:restore` | Copy verified to base db file | **PASS** |

---

## 2. Test Execution & Compliance Summary
Every requirement has been trace-linked to automated testing scripts. The integration tests and dataset validations ensure that no transaction drift occurs across different environments.
