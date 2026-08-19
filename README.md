<p align="center">
  <img src="public/assets/images/logo.png" alt="Stackly Logo" width="160" />
</p>

<h1 align="center">Stackly Workforce Analytics Platform</h1>

<p align="center">
  <strong>An enterprise-grade, role-based analytics dashboard powered by SQLite, React, TypeScript, and Express.</strong>
</p>

---

## 🚀 Overview

Stackly Workforce Analytics is a secure, high-performance web application designed for real-time workforce, attendance, productivity, and department-level tracking. Built from the ground up to utilize a single source of truth in **SQLite**, the project employs a role-based access control (RBAC) security paradigm spanning five defined roles: `Admin`, `HR`, `Manager`, `Team Lead`, and `Employee`.

## 🛠️ Tech Stack

- **Frontend**: React (18+), TypeScript, Vite, Redux Toolkit, React Query, Recharts, Vanilla CSS (curated design token system)
- **Backend**: Node.js, Express, tsx, Socket.IO
- **Database**: SQLite (via `better-sqlite3` with full support for migrations and transactional operations)
- **Quality**: Vitest, Playwright

## ⚡ Quick Start

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Seeding & Database setup
Initialize and seed the SQLite database:
```bash
npm run seed
```

### 3. Run Development Server
Start the backend Express API and the Vite frontend concurrently:
```bash
npm run dev
```

The application will be served locally at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📁 Repository Structure

```
├── backend/
│   ├── database/        # Database initialization scripts and schemas
│   ├── scripts/         # SQLite seed and verification scripts
│   └── src/
│       ├── config/      # Configuration (Logger, Redis, DB)
│       └── modules/     # Backend feature modules (auth, attendance, etc.)
├── database/
│   └── migrations/      # SQL migration scripts
├── frontend/
│   ├── public/          # Branding, favicons, static images
│   └── src/             # React application source
└── tests/               # Vitest integration and Playwright test suites
```

---

## 🛡️ Default Seed Credentials

For rapid verification, the database seeds the following user roles (all sharing the default password `StacklyWFA2026!`):

| Role | Email | Name |
| :--- | :--- | :--- |
| **Admin** | `admin@thestackly.com` | Sarah Connor |
| **HR** | `hr@thestackly.com` | Elena Rostova |
| **Manager** | `manager@thestackly.com` | David Sterling |
| **Team Lead** | `lead@thestackly.com` | Marcus Vance |
| **Employee** | `employee@thestackly.com` | Alex Mercer |

---

## Developed By

<div align="center">

### Developed by **Maheswari Pinneti**

**Frontend Developer at Stackly**

<br />

<img src="public/assets/images/logo.png" alt="Stackly Company Logo" width="180" />

<br />
<br />

**Workforce Analytics Platform**

Built with React, TypeScript, Express.js, SQLite, REST APIs, RBAC, and modern workforce analytics technologies.

</div>

---

### About the Developer

**Maheswari Pinneti**  
**Frontend Developer — Stackly**

Responsible for frontend development, UI implementation, responsive design, API integration, dashboard development, workforce analytics interfaces, testing, debugging, and continuous improvement of the Workforce Analytics Platform.

---

<div align="center">

**© 2026 Maheswari Pinneti | Stackly**

</div>
