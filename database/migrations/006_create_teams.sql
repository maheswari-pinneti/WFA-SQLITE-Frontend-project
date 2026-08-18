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
