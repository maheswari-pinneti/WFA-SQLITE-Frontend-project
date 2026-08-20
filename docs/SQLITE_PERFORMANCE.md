# SQLite Performance Optimization & Indexing Strategy

To handle high-throughput query performance for 500 active records and up to 500 concurrent operations, the following indexing strategy is implemented in the schema definition:

## 1. Primary Indexes on Employees

- **`idx_employees_id`**: Speeds up join operations on foreign key references mapping user accounts to employee profiles.
- **`idx_employees_code`**: Speeds up search queries and direct directory lookups referencing the corporate sequence number (e.g. `EMP-001` to `EMP-500`).
- **`idx_employees_email`**: Speeds up direct lookups for identity resolution during login operations and prevents table scans during duplicate verification.

## 2. Directory & Filtering Indexes

- **`idx_employees_role`**, **`idx_employees_dept`**, **`idx_employees_loc`**, and **`idx_employees_status`**: 
  - Essential for directory queries filtering active listings by corporate department, geographical region (Bengaluru, Salem, Hyderabad), and duty status (Active/Remote/Leave).
  - Eliminates full table scans when aggregating stats for the admin/HR dashboards.

## 3. User & Authentication Indexes

- **`idx_users_email`**: Crucial for instant user login and token validation queries against the `users` credentials table.

## 4. Attendance & Auditing Indexes

- **`idx_attendancerecords_date`**: Accelerates daily attendance dashboards and date-range reporting.
- **`idx_attendancerecords_emp_date`**: Composite index optimizing queries checking if a specific employee is clocked-in or taking a break on any given date.
- **`idx_audit_logs_timestamp`**: Speeds up audit trail reports sorted chronologically by the system.
