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
