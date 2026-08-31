# Stackly Workforce Analytics Platform Documentation

Welcome to the official technical documentation suite for the **Stackly Workforce Analytics Platform**.

---

## 📚 Documentation Index

### Core Guides
- 📖 [Project Overview](./Project-Overview.md) - System architecture, tech stack, and key features.
- 🚀 [Installation Guide](./Installation-Guide.md) - Setup instructions, environment variables, and build commands.
- 🎨 [Development Guidelines](./Development-Guidelines.md) - Coding conventions, design system, and accessibility standards.
- 🌿 [Git Workflow](./Git-Workflow.md) - Branching strategy, commit standards, and pull request workflow.
- 🧪 [Testing Strategy](./Testing-Strategy.md) - Type checking, unit testing, and E2E validation procedures.
- 🏛️ [Full-Stack Integration Architecture](./architecture/Backend-Database-Frontend-Integration.md) - Folder layout, Express server API, and SQLite database schemas.
- 💾 [SQLite Database Guide](./SQLITE_DATABASE_GUIDE.md) - Database setup, table structures, connection flows, migrations, seeding, query layers, and DB Browser verification.

### API Documentation
- 🌐 [API Overview](./api/API-Documentation.md) - REST API endpoints, response schemas, and error handling.
- 🔑 [Authentication API](./api/Auth-API.md) - Login, token validation, and role scoping endpoints.
- 📊 [Dashboard API](./api/Dashboard-API.md) - Executive scorecards, metric aggregations, and chart data APIs.
- 👥 [Employee API](./api/Employee-API.md) - 10,000 record workforce directory CRUD endpoints.

### Architecture Decision Records (ADRs)
- 🏛️ [ADR-001: Modular Feature Architecture](./decisions/ADR-001-Frontend-Architecture.md)
- ⚡ [ADR-002: Redux Toolkit State Management](./decisions/ADR-002-State-Management.md)
- 🔐 [ADR-003: JWT Authentication & Interceptors](./decisions/ADR-003-Authentication.md)
- 🛡️ [ADR-004: Enterprise RBAC & Permission Matrix](./decisions/ADR-004-Role-Based-Access.md)

---

## 🛠️ Technology Stack
- **Core Framework**: React 19, TypeScript, Vite
- **State Management**: Redux Toolkit, React Redux
- **Styling & UI**: Vanilla CSS Design Engine, Lucide React Icons
- **Data Visualization**: Recharts (Line, Bar, Area, Pie, Radar, Donut)
- **Routing & Security**: React Router DOM v6, Role Guards, Permission Matrix
