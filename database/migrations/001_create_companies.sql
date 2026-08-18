CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);
