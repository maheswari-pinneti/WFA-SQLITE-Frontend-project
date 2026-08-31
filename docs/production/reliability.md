# Workforce Analytics Intelligence Platform - Production Reliability & Hardening Guide

This document describes the production-hardening design decisions and operational parameters implemented to support up to 250 concurrent active users.

## 1. Database Resiliency & Optimization (SQLite Cloud / SQLite Fallback)

The database persistent layer uses a resilient SQLite architecture:

* **SQLite Cloud & Local Fallback**: The application attempts to connect to SQLite Cloud. If the connection fails, it dynamically falls back to a local SQLite file database (`wfa.sqlite` or `wfa-test.sqlite` in test mode), ensuring zero downtime.
* **Write-Ahead Logging (WAL) Mode**: To handle concurrency, the local SQLite database uses WAL journal mode (`journal_mode = WAL`) and `synchronous = NORMAL`. This allows concurrent readers and writers to operate simultaneously without locking the database.
* **Busy Timeout**: A `busy_timeout = 10000` (10 seconds) configuration ensures that the SQLite engine queues concurrent update requests instead of throwing immediate lock errors.
* **Index Strategy**: Dedicated indexes are configured on high-traffic columns to speed up querying:
  - Indexes on `mfa_settings(user_id)` and `mfa_recovery_codes(user_id)` to speed up multi-factor auth validation.
  - Indexes on key tables like `users(email)`, `employees(employeeCode)`, `attendance_records(employeeId)`, and `audit_logs(timestamp)`.

---

## 2. API Protection & Rate Limiting

To avoid denial of service and resource saturation, Express API rate limits are applied:
* **Global API Limit**: Configured at 5,000 requests per minute per IP to absorb spikes of multiple dashboard analytics queries per page.
* **Authentication Limit**: Tightened to 30 requests per minute per IP for `/auth/login`, `/auth/mfa-verify`, etc., preventing brute force attempts.
* **Refresh Token Limit**: Capped at 100 requests per minute per IP.

---

## 3. Real-Time Socket.IO Channel Protection

Socket connections are hardened using:
* **JWT Authentication**: Enforced via handshake authentication middleware on connection setup.
* **Scope-based Room Subscriptions**: Room subscriptions (`join-room`) are authorized by team, department, or user ID scope. Non-admin users are blocked from joining external rooms.
* **Event Rate Limiting & Filtering**: Throttling caps socket event messages to 20 per second per socket. Rapid duplicate events sent within 50ms are filtered.

---

## 4. Graceful Shutdown & Health Checks

* **Health Endpoints**:
  - `/live`: Simple liveness probe checking process health.
  - `/ready`: Readiness check verifying SQLite / SQLite Cloud database health via active ping query checks.
* **Graceful Exit**: On `SIGINT`/`SIGTERM`, the application stops accepting new HTTP connections, closes Socket.IO rooms, drains active HTTP requests, closes the SQLite database connection handles, and exits cleanly.
