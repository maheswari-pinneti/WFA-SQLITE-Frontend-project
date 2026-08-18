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
