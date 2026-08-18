CREATE TABLE IF NOT EXISTS attendancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  date TEXT NOT NULL,
  checkInTime TEXT,
  checkOutTime TEXT,
  breaks TEXT, -- JSON string representation of array of breaks
  shiftType TEXT DEFAULT 'Regular',
  workMode TEXT DEFAULT 'Office',
  status TEXT DEFAULT 'Checked Out',
  latitude REAL,
  longitude REAL,
  accuracy REAL,
  idempotencyKey TEXT UNIQUE,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);
