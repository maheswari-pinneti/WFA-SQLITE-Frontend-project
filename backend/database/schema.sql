-- schema.sql
-- WFA SQLite Database Schema

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  managerId TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  departmentId TEXT,
  leadId TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  startTime TEXT,
  endTime TEXT,
  gracePeriodMinutes INTEGER DEFAULT 0,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  team TEXT,
  location TEXT,
  title TEXT,
  clearanceLevel INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ACTIVE',
  permissions TEXT, -- Stored as JSON string representation of array
  mfa_enabled INTEGER DEFAULT 1,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS mfachallenges (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  consumed_at TEXT,
  resend_count INTEGER DEFAULT 0,
  created_at TEXT,
  status TEXT DEFAULT 'Pending',
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employeeCode TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'EMPLOYEE',
  department TEXT,
  designation TEXT,
  status TEXT DEFAULT 'ACTIVE',
  avatar TEXT,
  joinDate TEXT,
  performanceScore REAL DEFAULT 90,
  attendanceRate REAL DEFAULT 95,
  team TEXT,
  location TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  skillName TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  isTopSkill INTEGER DEFAULT 0,
  isMissingSkill INTEGER DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS performancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  quarter TEXT NOT NULL,
  kpiScore REAL DEFAULT 0,
  targetScore REAL DEFAULT 0,
  productivityScore REAL DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  assigneeId TEXT,
  assigneeName TEXT,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'TODO',
  points INTEGER DEFAULT 0,
  updatedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS leaverequests (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  type TEXT,
  startDate TEXT,
  endDate TEXT,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  reviewedBy TEXT,
  reviewComment TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read INTEGER DEFAULT 0,
  createdAt TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS attendancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  date TEXT NOT NULL,
  checkInTime TEXT,
  checkOutTime TEXT,
  breaks TEXT, -- JSON string representation of array of breaks
  shiftType TEXT DEFAULT 'Regular',
  workMode TEXT DEFAULT 'Office',
  status TEXT DEFAULT 'Checked Out',
  latitude REAL,
  longitude REAL,
  accuracy REAL,
  idempotencyKey TEXT UNIQUE,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS correctionrequests (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  date TEXT NOT NULL,
  requestedCheckIn TEXT,
  requestedCheckOut TEXT,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  managerComment TEXT,
  reviewedBy TEXT,
  createdAt TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS breaksessions (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS attendanceevents (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS idempotencyrecords (
  companyId TEXT NOT NULL,
  key TEXT NOT NULL,
  statusCode INTEGER NOT NULL,
  response TEXT NOT NULL, -- JSON string representation of response object
  expiresAt TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT,
  PRIMARY KEY (companyId, key)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  deviceFingerprint TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS refreshtokens (
  token_hash TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  tokenFamily TEXT NOT NULL,
  parentHash TEXT,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  employeeId TEXT,
  action TEXT,
  details TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employees_id ON employees(id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employeeCode);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_loc ON employees(location);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendancerecords_date ON attendancerecords(date);
CREATE INDEX IF NOT EXISTS idx_attendancerecords_emp_date ON attendancerecords(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
