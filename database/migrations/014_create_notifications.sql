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
