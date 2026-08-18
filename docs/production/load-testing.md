# Load Testing & Resiliency Validation Guide

This document describes the load-testing methodology and verification script implemented to validate the Workforce Analytics Platform under 250 concurrent users.

## 1. Concurrency Simulation Concept

To run a realistic load test without artificial CPU blocks on the single Node.js process (due to pure-JS Bcrypt hashing), we separate the verification into two distinct pipelines:

1. **Sequential Authentication Check**:
   A lightweight, sequential 5-user benchmark verifying the actual `/auth/login` and `/auth/mfa-verify` APIs. This ensures encryption verification, database records creation (MFA challenge rows), and token signing work perfectly.
2. **Concurrent Analytics & Dashboard Load**:
   A concurrent batch execution of 250 active users. Distinct JWT tokens are pre-generated beforehand based on 250 seeded active database users. These 250 users concurrently invoke 9 critical data-fetching and analytics APIs representing complete dashboard page loads.

### Operations Breakdown
* Concurrent Users: **250**
* API Queries per User: **9**
* Total Concurrent API Requests: **2,250**

---

## 2. API Scope of Scenarios

Each concurrent user script executes the following endpoints in parallel:
* `/v1/auth/me` (Profile retrieval)
* `/v1/employees?page=1&limit=10` (Scoped employee roster pagination)
* `/v1/dashboard/summary` (Core metrics card aggregates)
* `/v1/dashboard/workforce` (Department/team distribution stats)
* `/v1/dashboard/headcount` (Location & headcount aggregates)
* `/v1/dashboard/risk` (Retention & turnover risk assessment stats)
* `/v1/analytics/employee-growth` (Time-series headcount trend)
* `/v1/analytics/attendance-trend` (Time-series attendance curves)
* `/v1/analytics/performance` (KPI & target trends)

---

## 3. Running the Load Test

Run the simulated load test using:

```bash
node tests/load/loadTest.js
```

### Targets & Criteria for Success
* **Total Operations**: 2,250 calls
* **Success Rate**: ≥ 99.00%
* **Failed calls**: 0
* **p95 Latency**: < 2,000 ms
