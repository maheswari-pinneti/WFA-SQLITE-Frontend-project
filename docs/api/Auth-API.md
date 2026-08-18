# Authentication API Specification

Endpoint specifications for authenticating users, managing JWT tokens, and switching security role scopes.

---

## 🔑 Endpoints

### 1. `POST /api/v1/auth/login`
Authenticates a user via corporate email and returns a JWT token.

### 2. `POST /api/v1/auth/switch-role`
Switches active security role scope (`ADMIN`, `HR`, `TEAM_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`).
