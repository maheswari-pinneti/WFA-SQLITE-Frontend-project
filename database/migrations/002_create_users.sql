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
