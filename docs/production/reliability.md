# Workforce Analytics Intelligence Platform - Production Reliability & Hardening Guide

This document describes the production-hardening design decisions and operational parameters implemented to support up to 250 concurrent active users.

## 1. Database Resiliency & Optimization (MongoDB)

Although MongoDB is a highly scalable document database, it is optimized for high-performance production workloads under proper configurations:

* **Connection Pooling**: Configured via connection string parameters and Mongoose options (`maxPoolSize: 50`, `minPoolSize: 10`). This ensures a ready supply of reusable connections to avoid socket allocation overhead during high concurrent traffic spikes.
* **Auto-Reconnect & Timeout Limits**: Timeout parameters (`socketTimeoutMS: 45000`, `serverSelectionTimeoutMS: 3000`) prevent backend API threads from hanging during network partitioning, failing fast and failing gracefully.
* **Index Strategy**: High-traffic search queries and dashboard aggregate pipelines are backed by dedicated collection indices:
  - Single column indexes: `users(email)`, `employees(employeeCode)`, `attendancerecords(employeeId)`, `attendancerecords(date)`, `auditlogs(timestamp)`
  - Compound indexes: `idempotencyrecords(companyId, key)` to support fast double-submission preventions.
  - TTL (Time-To-Live) indexes: `idempotencyrecords(expiresAt)` automatically cleans up transaction session records.

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
  - `/ready`: Readiness check verifying MongoDB server status via active ping check.
* **Graceful Exit**: On `SIGINT`/`SIGTERM`, the application stops accepting new HTTP connections, closes Socket.IO rooms, drains active HTTP requests, closes the Mongoose/MongoDB connection, and exits cleanly.
