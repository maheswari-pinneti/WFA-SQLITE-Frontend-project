# Testing Strategy & Quality Assurance

This document details the quality assurance procedures, the test runner, and the exact specifications of the 30 unit and integration tests written for the **Workforce Analytics Platform**.

---

## 🧪 Verification Layers

### 1. Unit & Integration Testing (Vitest)
We use **Vitest** as our core test runner. It allows fast, parallelized execution of ES module tests with built-in mock environments.
To execute all tests:
```bash
npm run test
```

### 2. TypeScript Type Safety
Runs static type checking across the whole project:
```bash
npm run typecheck
```

### 3. Vite Production Compilation
Validates rollup bundling and code splitting compatibility:
```bash
npm run build
```

---

## 📋 Comprehensive List of the 30 Tests

The test suite is structured inside the [tests/unit/](file:///c:/Users/91970/Documents/MAHE/OneDrive/Desktop/WFA-Rolebased-Architecture-main/tests/unit) directory:

### A. RBAC & Roles Specifications (`tests/unit/auth.test.ts`)
Verifies role definitions, access paths, and permission structures.

1. **"should match roles to their corporate titles"**:
   - Asserts that `ROLE_LABELS` matches roles (`Role.ADMIN`, `Role.HR`, etc.) to human-readable strings.
2. **"should route roles to correct dashboard entry points"**:
   - Asserts that `ROLE_HOME_PATHS` maps users to their respective workspace dashboard panels.
3. **"should declare strict nested hierarchy ranks"**:
   - Asserts that role ranks follow the correct zero-trust priority order (`Role.ADMIN = 0` to `Role.EMPLOYEE = 4`).
4. **"should map legacy permission codes to correct modern counterparts"**:
   - Validates mapping of permission codes (e.g. `SYSTEM_ALL` mapping to `VIEW_ALL_DATA`).

### B. Smart Attendance & Geofencing (`tests/unit/attendance.test.ts`)
Verifies clocking actions, geographical calculations, and state machine boundaries.

5. **"should correctly measure distance within bounds"**:
   - Asserts the Haversine distance formula returns less than 100 meters for close coordinates.
6. **"should correctly flag coordinates outside office boundary"**:
   - Asserts distance returns greater than 100 meters for coordinates far from the Bangalore campus.
7. **"should allow normal check-in and check-out transition"**:
   - Asserts that checking in sets status to `Checked In` and checking out sets status to `Checked Out` with timestamps.
8. **"should reject duplicate check-in attempts"**:
   - Asserts that active duty users cannot check in twice.
9. **"should reject check-out before check-in"**:
   - Asserts that non-clocked users cannot check out.
10. **"should support take break and resume cycle"**:
    - Validates state shifts from `Working` ➔ `On Break` ➔ `Working` and logs accurate break timestamps.
11. **"should reject check-in if coordinates are missing for In-Office mode"**:
    - Asserts validation throws an error if coordinates are absent when work mode is set to 'Office'.
12. **"should reject check-in if coordinates are outside Bengaluru office radius"**:
    - Asserts that geofencing flags coordinates outside the allowed MAHE campus perimeter.
13. **"should allow check-in if coordinates are within office bounds"**:
    - Asserts check-in succeeds if coordinates match the office lat/long coordinates.
14. **"should correctly flag late arrival on regular shift"**:
    - Asserts that arriving past the 9:15 AM grace period sets the `lateArrival` flag to true.
15. **"should calculate accurate working hours and overtime"**:
    - Validates that break intervals are deducted from overall duration to compute net working hours.
16. **"should queue attendance actions offline and process them upon synchronization"**:
    - Verifies that offline clock actions are saved to `localStorage` queue and successfully synced when network is restored.

### C. Backend API Integration & Authorization Tests (`tests/unit/api.test.ts`)
Verifies Express routes, HTTP methods, payloads, headers, tokens, and data validation.

17-28. **12 API & Controller Security Tests**:
   - Authenticate ADMIN, HR, MANAGER, TEAM_LEAD, and EMPLOYEE.
   - Enforce DBAC/RBAC scope-based data isolation for department/team listings.
   - Prevent parameter tampering and invalid status transitions.

### D. E2E User Flow Tests (`tests/unit/e2e.test.ts`)
Validates complete multi-step lifecycle scenarios.

29. **"Flow: Login -> Check-In -> Break -> Resume -> Check-Out -> View History"**:
    - Asserts seamless authentication, clocking, state transition, activity log persisting, and history listing.
30. **"should enforce geofence, duplicate check-in, and double-checkout restrictions"**:
    - Asserts robust system defense when boundary parameters or actions are violated.

