CREATE TABLE IF NOT EXISTS attendanceevents (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);
