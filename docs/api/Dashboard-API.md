# Dashboard API Specification

Endpoint specifications for fetching role-specific scorecard KPIs, metric aggregations, and chart data points.

---

## 📊 Endpoints

### 1. `GET /api/v1/dashboard/metrics`
Returns metric aggregations for the active role scope (e.g. Total Headcount `10,000`, Active Workforce `9,450`).

### 2. `GET /api/v1/dashboard/charts`
Returns visual data series for the 7 Recharts visualizations.
