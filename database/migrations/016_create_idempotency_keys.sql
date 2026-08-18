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
