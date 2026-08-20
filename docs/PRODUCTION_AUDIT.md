# Production Audit & Assessment Report (WFA-SQLITE)

This audit documents the current production status, vulnerabilities, and recommended enhancements for the Workforce Analytics (WFA) application.

## 1. Executive Summary & Production Gate Status
The application utilizes an express-based backend running with local SQLite (powered by `better-sqlite3` driver) or optional remote SQLite Cloud. The frontend runs React via Vite. 

- **Database Persistent State**: SQLite is verified as the sole engine (no external MongoDB/PostgreSQL dependencies).
- **Audit Conclusion**: **PASS WITH CONDITIONS**. The basic application core functions correctly, but requires database tuning, security rate-limiting enhancements, deterministic seeding expansion, and high-concurrency validation.

---

## 2. Infrastructure & SQLite Internals Assessment

### SQLite Configuration & Concurrency
- **File System Permissions**: Needs hardening to `0600` (readable/writable only by the owner).
- **WAL (Write-Ahead Logging)**: Currently enabled during the fallback initialization in `sqlite-cloud.ts`. It provides outstanding concurrency improvements.
- **Checkpointing Strategy**: Passive checkpointing needs implementation to prune WAL file growth.
- **Busy Timeout**: Set to `10000ms` which prevents connection blockage but needs transaction lock monitoring during stress load.

### Database Indexing Rationale
Active analysis shows missing indexes on query filter columns. We will create:
- `idx_employees_id` on `employees(id)`
- `idx_employees_code` on `employees(employeeCode)`
- `idx_employees_email` on `employees(email)`
- `idx_employees_role` on `employees(role)`
- `idx_employees_dept` on `employees(department)`
- `idx_employees_loc` on `employees(location)`
- `idx_employees_status` on `employees(status)`
- `idx_users_email` on `users(email)`
- `idx_attendancerecords_date` on `attendancerecords(date)`
- `idx_attendancerecords_emp_date` on `attendancerecords(employeeId, date)`

---

## 3. Security, Authentication, & RBAC Matrix
The current signup controls block direct creation of ADMIN or HR roles via public API endpoints. However, the update endpoint should be verified to prevent horizontal role manipulations.

### RBAC Feature Control Matrix

| Feature | Admin | HR | Manager | Team Lead | Employee |
| --- | :---: | :---: | :---: | :---: | :---: |
| Dashboard Summary | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Employees | All | All | Team | Team Member | Own |
| Edit Employees | ✓ | ✓ | ✓ | Limited | No |
| Attendance Log | ✓ | ✓ | ✓ | ✓ | Own |
| Reports Generation | ✓ | ✓ | ✓ | Limited | No |
| User Control | ✓ | ✓ | No | No | No |

---

## 4. Disaster Recovery & Capacity Parameters
- **RPO (Recovery Point Objective)**: 1 Hour (using hourly scheduled SQLite hot backups).
- **RTO (Recovery Time Objective)**: 5 Minutes (using rapid database replacement and directory swap).
- **Hot Backup Setup**: Leverage SQLite's online backup APIs or structured filesystem copies while the database is locked to ensure zero-corruption transaction states.
