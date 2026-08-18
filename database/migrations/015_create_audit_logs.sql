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
