# Project Directory & Folder Structure

This document outlines the directory structure of the Workforce Analytics Platform to ensure clean division of responsibilities, modular code organization, and standard architecture patterns.

```text
WFA-Rolebased-Architecture-main/
├── backend/                       # Backend Express API Service
│   ├── scripts/                   # Simulator and seed execution scripts
│   └── src/                       # Main source code
│       ├── config/                # Environment variables, MongoDB/Mongoose initialization, and logging configs
│       ├── controllers/           # HTTP Request controllers (handling API logic)
│       ├── middleware/            # JWT validation, Role checks, ABAC limits, and Rate limiters
│       ├── routes/                # API route definitions (/v1/...)
│       ├── services/              # Business logic services (MFA delivery, Session tracking, employee updates)
│       └── app.js                 # Express application instantiation
├── database/                      # Database design specifications and documentation
├── docs/                          # Architecture and design documentation
│   ├── security/                  # Threat models and security assessments
│   └── architecture/              # Folder structures and design patterns
├── frontend/                      # Client-side React Single Page Application (SPA)
│   ├── app/                       # Global providers, routing definitions, and Redux store configuration
│   ├── assets/                    # Static image and style assets
│   ├── auth/                      # Authentication flows, MFA, login forms, and auth hooks
│   ├── components/                # Reusable UI component modules (cards, charts, calendar widgets)
│   ├── features/                  # Permission-aware feature domains (admin, hr, manager, employee dashboards)
│   ├── security/                  # Frontend route guards and Role checks
│   ├── store/                     # Global layout states (sidebar, theme, alerts)
│   └── main.tsx                   # React root startup script
└── tests/                         # Automated test suites
    ├── load/                      # 250 concurrent user resiliency load tests
    └── unit/                      # Controller, Service, and Schema unit tests
```

---

## Folder Guideline
1. **Frontend State & Components**:
   - Keep global layout states in `frontend/store/`.
   - Feature-specific UI dashboards belong in `frontend/features/<role>/`.
2. **Backend API Routing**:
   - Write request controllers in `backend/src/controllers/`.
   - Ensure all routes in `backend/src/routes/api.routes.js` are protected by `authenticateToken` and rate limiters.
