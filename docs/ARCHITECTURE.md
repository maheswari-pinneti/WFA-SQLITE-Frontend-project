# Workforce Analytics Platform Architecture Guide

This guide describes the SQLite-based architecture of the Workforce Analytics Platform, detailing components, session lifecycles, and security integrations.

---

## 1. Database & Persistence Layer

The platform utilizes a dynamic, serverless SQLite architecture built on top of `better-sqlite3`.

### SQLite Connection & Configuration
* **Connection Lifecycle:** Handled inside [connection.ts](file:///c:/Users/91970/Documents/WFA-SQLITE-Frontend-project/backend/src/database/connection.ts).
* **WAL Mode (Write-Ahead Logging):** Enabled to allow concurrent read operations to execute while a write operation is active.
* **Foreign Keys:** Enabled explicitly (`PRAGMA foreign_keys = ON`) on database connection initialization.
* **Busy Timeout:** Configured to `5000ms` (`PRAGMA busy_timeout = 5000`) to queue read/write threads and prevent connection lockouts (`SQLITE_BUSY`).

---

## 2. Authentication & Session Lifecycles

### Multi-Factor Authentication (MFA)
1. **Credentials Submission:** User logs in via username and password. If credentials match, the system creates a temporary MFA challenge.
2. **OTP Generation:** A 6-digit cryptographic OTP is generated and simulated to email/SMS targets (dev log prints hint).
3. **Session Recovery:** The frontend stores the challenge states inside `sessionStorage`. On page reloads, the state is re-hydrated to recover the OTP input form.
4. **Validation Lockout:** If a user registers 5 consecutive invalid login attempts, the database writes a lockout event inside the `failed_logins` table, denying authentication requests for 15 minutes.

### Token Rotation (Refresh Tokens)
* **Access Tokens:** Signed with a short lifespan (15 minutes).
* **Refresh Tokens:** Persistent tokens mapped in the SQLite `refreshtokens` table.
* **Axios Interceptor Queue:** The frontend [api.ts](file:///c:/Users/91970/Documents/WFA-SQLITE-Frontend-project/frontend/src/services/api.ts) interceptor catches `401 Unauthorized` states, stalls pending requests in a queue, requests new keys from `/v1/auth/refresh`, updates the tokens, and replays all queued actions seamlessly.

---

## 3. Dynamic Aggregations (Analytics)

All dashboard cards and graphs query live SQLite aggregates rather than static mock lists:
* **KPI Calculations:** Computed utilizing SQLite SQL aggregations (`COUNT`, `AVG`, `ROUND`).
* **Scoping Boundaries:** Enforced strictly based on authenticated session parameters:
  * `ADMIN` & `HR`: Global view access across all departments.
  * `MANAGER`: Grouped view filtered by the manager's department.
  * `TEAM_LEAD`: Restricted team-level view.
  * `EMPLOYEE`: Access isolated solely to own user logs.

---

## 4. Production Security Hardening

* **Rate Limiting:** Global rate limiters (5,000 requests/min per IP) and strict auth limiters (30 requests/min per IP) protect from brute-force attempts.
* **Helmet Headers:** Express is secured via Helmet to inject CSP, HSTS, frame options, and XSS headers.
* **Error Boundaries:** Frontend crashes are caught by a custom React `<ErrorBoundary>` wrapper displaying stackly branding and allowing one-click state recovery.
