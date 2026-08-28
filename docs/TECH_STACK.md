# 🛠️ Workforce Analytics Platform Technology Stack Reference

This document catalogs all technologies, frontend/backend dependencies, development tools, and database drivers utilized in the Workforce Analytics Platform, as extracted from the root [`package.json`](file:///c:/Users/91970/Documents/WFA-SQLITE-Frontend-project/package.json).

---

## 1. Core Framework & Environments

| Technology | Declared Version | Purpose / Rationale |
| :--- | :--- | :--- |
| **React** | `^18.2.0` | Client-side SPA UI rendering engine. |
| **React DOM** | `^18.2.0` | DOM rendering targets. |
| **TypeScript** | `^5.2.2` (dev) | Static type safety and autocomplete support. |
| **Node.js Target** | `^20.x` | Execution runtime environment. |

---

## 2. Production Dependencies

### UI Component Framework & Layout
- **MUI Core (`@mui/material`)**: `^9.2.0` — Component library base (Inputs, grids, modals).
- **MUI Icons (`@mui/icons-material`)**: `^9.2.0` — Material icon assets.
- **Emotion (`@emotion/react`, `@emotion/styled`)**: `^11.14.0` / `^11.14.1` — CSS-in-JS style system supporting theme overrides.
- **Lucide Icons (`lucide-react`)**: `^0.475.0` — High performance modern SVG iconography.
- **CLSX (`clsx`)**: `^2.1.0` — Utility helper to conditionally construct className strings.

### State Management & Navigation
- **Redux Toolkit (`@reduxjs/toolkit`)**: `^2.2.1` — Dynamic client state container (Auth tokens, sidebar drawer collapse toggle).
- **React Redux (`react-redux`)**: `^9.1.0` — Binding APIs between React views and Redux store.
- **React Router DOM (`react-router-dom`)**: `^6.30.4` — Nested route config and client guards.
- **React Query (`@tanstack/react-query`)**: `^5.28.4` — Async server state caching, background polling, and automated refetching.

### Database Drivers
- **Better SQLite3 (`better-sqlite3`)**: `^11.1.2` — Local persistent database engine.
- **SQLite Cloud Drivers (`@sqlitecloud/drivers`)**: `^1.0.880` — Client driver for database replication, syncing, and remote cloud hosting.

### Network, Auth, Security & Utilities
- **Axios (`axios`)**: `^1.6.7` — HTTP client client interceptors, JWT refresh hooks, and telemetry header injections.
- **BcryptJS (`bcryptjs`)**: `^3.0.3` — Salt hashing for secure user passwords.
- **JsonWebToken (`jsonwebtoken`)**: `^9.0.2` — JWT token generation and validation middleware.
- **Express (`express`)**: `^4.21.2` — Backend REST API routing framework.
- **Helmet (`helmet`)**: `^8.0.0` — Secures HTTP headers against sniffing, XSS, and Clickjacking.
- **Express Rate Limit (`express-rate-limit`)**: `^8.6.2` — Rate limiter middleware for API security.
- **CORS (`cors`)**: `^2.8.5` — Cross-Origin Resource Sharing middleware.
- **Compression (`compression`)**: `^1.8.1` — Gzip compression for server response optimization.
- **Dotenv (`dotenv`)**: `^16.4.5` — Dynamic `.env` configuration file loading.
- **Recharts (`recharts`)**: `^3.10.1` — SVG charting system (Line, Bar, Donut, and Scatter plots).
- **OTPLib (`otplib`)**: `^13.4.1` — TOTP (MFA/OTP) generation and validation.
- **QRCode (`qrcode`)**: `^1.5.4` — Renders authentic MFA registration barcodes.
- **Socket.IO (`socket.io`)**: `^4.8.3` — Backend WebSockets integration.
- **Socket.IO Client (`socket.io-client`)**: `^4.8.3` — Frontend real-time updates integration.

---

## 3. Development & Testing Dependencies

### Build Tools
- **Vite (`vite`)**: `^5.1.4` — Client-side bundler and HMR server.
- **Vite React Plugin (`@vitejs/plugin-react`)**: `^4.2.1` — Standard React bundling rules.
- **Concurrently (`concurrently`)**: `^10.0.4` — Runs backend and frontend development scripts in parallel.
- **TSX (`tsx`)**: `^4.23.12` — Executes TypeScript scripts (`.ts`) on Node.js directly.

### Unit, Integration, & E2E Testing
- **Vitest (`vitest`)**: `^1.3.1` — High-performance testing framework.
- **Vitest Coverage (`@vitest/coverage-v8`)**: `^1.3.1` — Code coverage tracking.
- **Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)**: Testing environment helper utilities.
- **JSDOM (`jsdom`)**: `^29.1.1` — In-memory browser context for unit tests.
- **Playwright (`@playwright/test`)**: `^1.62.1` — Multi-browser end-to-end integration test runner.
- **TypeScript Node Definitions (`@types/node`, `@types/better-sqlite3`, `@types/react`, `@types/react-dom`, `@types/qrcode`)**: Typings for dependencies.
