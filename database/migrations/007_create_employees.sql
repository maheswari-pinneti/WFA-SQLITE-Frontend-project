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
