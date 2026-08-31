# SQLite Database Guide

This document describes how the SQLite database is structured, initialized, seeded, queried, and verified in the **Stackly Workforce Analytics (WFA) Platform**.

---

## 1. Database Directory & Key Files

The SQLite database schema and helper scripts are organized as follows:

```text
backend/
├── database/
│   └── schema.sql                  # Primary CREATE TABLE and INDEX statement definitions
│
├── scripts/
│   ├── seed-sqlite.js              # Node.js seed script to populate test data
│   ├── seed-sqlite.ts              # TypeScript seed script counterpart
│   ├── verify-sqlite.js            # Validation script for local SQLite data
│   └── verify-dataset.ts           # TypeScript verification runner
│
└── src/
    └── database/
        ├── connection.ts           # Core initialization, migration runner, and health checks
        ├── query.ts                # Dynamic SELECT, INSERT, UPDATE, and DELETE query helper functions
        └── sqlite.ts               # Local SQLite driver wrapper interface
```

---

## 2. Table Schemas & Indexes

All tables are defined in [`schema.sql`](file:///c:/Users/91970/Documents/WFA-SQLITE-Frontend-project/backend/database/schema.sql). These tables support full workforce tracking, shifts, attendance, performance, and authentication:

* **Core Tables**: `companies`, `departments`, `teams`, `shifts`, `locations`, `users`, `employees`, `skills`, `performancerecords`, `tasks`, `leaverequests`, `notifications`.
* **Attendance Tracking**: `attendancerecords`, `breaksessions`, `attendanceevents`, `correctionrequests`.
* **Authentication & Safety**: `mfa_settings`, `mfa_recovery_codes`, `mfachallenges`, `failed_logins`, `oauth_states`, `sessions`, `refreshtokens`, `idempotencyrecords`, `audit_logs`.

### High-Performance Indexes
Critical lookups are optimized using performance-oriented indexes to prevent table scans:
* **Employees/Users**: `idx_employees_code`, `idx_employees_email`, `idx_users_email`.
* **Attendance & Audit**: `idx_attendancerecords_date`, `idx_attendancerecords_emp_date` (composite), `idx_audit_logs_timestamp`.

---

## 3. Database Initialization Flow

When the backend server starts, the system automatically checks, establishes, and verifies the database connection using the following flow:

```text
Application Starts
       │
       ▼
initDb() (connection.ts)
       │
       ▼
connectDatabase() (sqlite-cloud.ts)
       │
       ├─► Connects to SQLite Cloud URL (if configured)
       └─► Fallback to local SQLite file: database/sqlite/wfa.sqlite
       │
       ▼
PRAGMA Schema Check & Migrations
       │ (Auto-creates tables from schema if not present)
       ├─► Checks and ALTERs missing columns (e.g. authProvider, providerSubject)
       └─► Creates tables/indexes if they do not exist
       │
       ▼
Health Check & Write Verification
       ├─► INSERT test record to audit_logs
       ├─► Verify SQLite write capability
       └─► DELETE test record
       │
       ▼
Database Ready & Server Listens
```

---

## 4. Initialization & Seeding Commands

Use the following commands from the project root to configure and populate the database environment:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed SQLite Database
Runs the database seeding script to populate users, 250+ employees, attendance records, and lookup entities:
```bash
npm run seed
```

### Step 3: Run Development Servers
Starts the backend Express API (on port `5001`) and Vite frontend (on port `3000`):
```bash
npm run dev
```

---

## 5. Local Inspection & Verification (DB Browser for SQLite)

You can visually browse the tables, records, and test SQL queries using a GUI utility:

1. Download and install **[DB Browser for SQLite](https://github.com/sqlitebrowser/sqlitebrowser)**.
2. Launch DB Browser and click **Open Database**.
3. Select the local file: `database/sqlite/wfa.sqlite` (created relative to project root).
4. Select the **Browse Data** tab to view records for tables such as `employees`, `users`, or `attendancerecords`.

### Helpful Diagnostics Queries
Under the **Execute SQL** tab in DB Browser, you can run manual queries:

#### Show All Database Tables
```sql
SELECT name FROM sqlite_master WHERE type = 'table';
```

#### Fetch Employee Directory Data
```sql
SELECT * FROM employees;
```

#### Check Seeding Stats
```sql
SELECT department, COUNT(*) as headcount FROM employees GROUP BY department;
```

#### Verify Table Columns & Settings
```sql
PRAGMA table_info(employees);
```

---

## 6. Full-Stack Data & Query Flow

The architecture operates with a clean separation of concerns, routing requests from the UI to the SQLite database files:

```text
       React Frontend (Client Browser)
                     │
                     ▼ [REST API Request]
          Express Router Layer
                     │
                     ▼
          Express Controller / Service
                     │
                     ▼
       Database Query Helper Layer (query.ts)
                     │
                     ▼ [SQL Statement]
          better-sqlite3 Driver
                     │
                     ▼
         Local SQLite (wfa.sqlite)
```

For instance, when loading the Employee Directory page:
1. **React** makes a `GET` request to `/api/employees`.
2. The controller at `employee.controller.ts` calls the service layer.
3. The service calls `query()` in `query.ts`.
4. `query.ts` performs the raw `SELECT * FROM employees` operation against `wfa.sqlite` using the SQLite driver.
5. The result sets are packaged as a JSON response envelope and returned to React.
