# 🗄️ Database Architecture

This document describes the SQLite database tables, schema structure, relationships, indexes, and columns in the Workforce Analytics system.

The database uses SQLite (local file database during development, and SQLite Cloud for production persistence), utilizing relational constraints, foreign keys, and indexes.

## 1. Database Tables Overview

```mermaid
erDiagram
    users ||--o{ attendancerecords : logs
    users ||--o{ correctionrequests : submits
    users ||--o{ auditlogs : triggers
    attendancerecords ||--o{ breaksessions : contains

    users {
        string id PK
        string name
        string email "unique, indexed"
        string password_hash
        string role "ADMIN | HR | MANAGER | TEAM_LEAD | EMPLOYEE"
        string department
        string team
        string location
        string title
        int clearanceLevel
        string status "ACTIVE | INACTIVE"
        array permissions
        int mfa_enabled
        string companyId "indexed"
    }

    employees {
        string id PK
        string employeeCode "unique, indexed"
        string name
        string email "unique, indexed"
        string role
        string department "indexed"
        string designation
        string status "indexed"
        string avatar
        string joinDate
        int performanceScore
        int attendanceRate
        string team
        string location "indexed"
        string companyId "indexed"
    }

    attendancerecords {
        string id PK
        string employeeId "indexed"
        string employeeName
        string department
        string date "indexed"
        string checkInTime
        string checkOutTime
        array breaks
        string shiftType
        string workMode "Office | Remote"
        string status "Checked In | Checked Out | Break"
        double latitude
        double longitude
        double accuracy
        string idempotencyKey "unique"
        string companyId "indexed"
    }

    correctionrequests {
        string id PK
        string employeeId "indexed"
        string employeeName
        string department
        string date "indexed"
        string requestedCheckIn
        string requestedCheckOut
        string reason
        string status "PENDING | APPROVED | REJECTED"
        string managerComment
        string reviewedBy
        string createdAt
        string companyId "indexed"
    }

    breaksessions {
        string id PK
        string attendanceRecordId "indexed"
        string startTime
        string endTime
        string status "ACTIVE | COMPLETED"
        string companyId "indexed"
    }

    mfachallenges {
        string id PK
        string userId "indexed"
        string otp_hash
        string expires_at
        int attempts_count
        int max_attempts
        string consumed_at
        int resend_count
        string status "Pending | Verified | Expired"
        string companyId "indexed"
    }

    auditlogs {
        string id PK
        string employeeId "indexed"
        string action
        string details
        string timestamp
        string companyId "indexed"
    }
```

## 2. Tables and Indexes

### Users Table (`users`)
- **Key Fields**: `id`, `email`, `password_hash`, `role`, `companyId`.
- **Indexes**:
  - `id`: Unique index for internal lookup references.
  - `email`: Unique index for authentication queries.
  - `companyId`: Index for multi-tenant isolation query scoping.

### Employees Table (`employees`)
- **Key Fields**: `id`, `employeeCode`, `name`, `email`, `department`, `location`, `companyId`.
- **Indexes**:
  - `id`: Unique lookup index.
  - `employeeCode`: Unique identifier index.
  - `email`: Unique email index.
  - `department`: Scoped queries for department filters.
  - `location`: Queries filtering employees by office branch.

### Attendance Table (`attendancerecords`)
- **Key Fields**: `id`, `employeeId`, `date`, `status`, `idempotencyKey`.
- **Indexes**:
  - `employeeId` + `date`: Compound index for daily logs lookup.
  - `idempotencyKey`: Unique index to prevent duplicate check-in API processing.

### Correction Requests Table (`correctionrequests`)
- **Key Fields**: `id`, `employeeId`, `date`, `status`.
- **Indexes**:
  - `employeeId`: Speeds up retrieval of individual submission logs.
  - `status`: Index to quickly locate pending approvals for managers.
