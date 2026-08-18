# Employee Directory API Specification

Endpoint specifications for fetching, filtering, and updating workforce records across the 10,000 employee dataset.

---

## 👥 Endpoints

### 1. `GET /api/v1/employees`
Returns the 10,000 employee workforce directory array.

### 2. `PATCH /api/v1/employees/:id/status`
Updates employee shift status (`PRESENT`, `REMOTE`, `ON_LEAVE`, `OFFLINE`).
