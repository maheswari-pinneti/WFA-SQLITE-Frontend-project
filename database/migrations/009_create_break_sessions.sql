CREATE TABLE IF NOT EXISTS breaksessions (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);
