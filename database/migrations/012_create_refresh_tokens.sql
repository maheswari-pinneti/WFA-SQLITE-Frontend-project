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
