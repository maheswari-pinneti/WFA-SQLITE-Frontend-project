# Enterprise Workforce Analytics Intelligence Platform
## Frontend Architecture & Engineering Specification Manual
**Version:** 3.4.0  
**Prepared By:** Maheswari Pinneti, Frontend Developer  
**Target Platform:** Enterprise Web Applications  
**Core Framework:** React 19 + TypeScript + Redux Toolkit + React Query + Material UI (MUI v6)  

---

## Table of Contents

1. [Executive Summary & Scope](#1-executive-summary--scope)
2. [Frontend Technology Stack & Tooling Specifications](#2-frontend-technology-stack--tooling-specifications)
3. [Enterprise Directory Structure & Modular Architecture](#3-enterprise-directory-structure--modular-architecture)
4. [Design System & Component Library Specifications](#4-design-system--component-library-specifications)
5. [State Management Architecture (Redux Toolkit & React Query)](#5-state-management-architecture-redux-toolkit--react-query)
6. [Role-Based Access Control (RBAC) & Security Layer](#6-role-based-access-control-rbac--security-layer)
7. [Feature Modules & UI Page Layout Specifications](#7-feature-modules--ui-page-layout-specifications)
8. [API Integration Layer & HTTP Network Architecture](#8-api-integration-layer--http-network-architecture)
9. [Data Visualization Engine (Recharts & D3 Integration)](#9-data-visualization-engine-recharts--d3-integration)
10. [Form Architecture & Dynamic Validation Engine](#10-form-architecture--dynamic-validation-engine)
11. [Performance Optimization, Caching & Web Vitals Strategy](#11-performance-optimization-caching--web-vitals-strategy)
12. [Accessibility (a11y), Internationalization (i18n) & Theme Engine](#12-accessibility-a11y-internationalization-i18n--theme-engine)
13. [Frontend Testing Strategy & Quality Assurance](#13-frontend-testing-strategy--quality-assurance)
14. [Build Pipeline, Docker Containerization & CI/CD Deployment](#14-build-pipeline-docker-containerization--cicd-deployment)
15. [Appendix & Developer Onboarding Guide](#15-appendix--developer-onboarding-guide)

---

## 1. Executive Summary & Scope

### 1.1 Platform Overview
The **Workforce Analytics Intelligence Platform** frontend is a multi-tenant, micro-frontend ready, enterprise-grade Single Page Application (SPA). It provides interactive dashboards, workforce metrics, employee lifecycle management, attendance tracking, team management, salary analytics, and executive reporting across 5 distinct operational role levels (Admin, HR Manager, Team Manager, Team Lead, Employee).

### 1.2 Architectural Goals
* **Sub-100ms UI Responsiveness:** Aggressive client-side caching, virtualized data grids, and state decoupling to maintain immediate feedback loops.
* **Strict 5-Tier RBAC:** Zero-trust presentation layer rendering where UI elements, navigation options, routes, and data columns are conditionally compiled/rendered according to authenticated user claims.
* **Design System Uniformity:** A unified design language built on custom CSS variables integrated seamlessly with Material UI (MUI v6) theme overrides.
* **Resilient Offline & Partial State Hydration:** React Query (TanStack Query v5) server-state caching combined with Redux Toolkit for seamless handling of background refetches, optimistic UI updates, and graceful error boundaries.

---

## 2. Frontend Technology Stack & Tooling Specifications

| Technology Layer | Tool / Library | Version | Selection Rationale / Usage |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | `^19.0.0` | Concurrent rendering, Server/Client Component paradigms, optimized transitions (`useTransition`, `useDeferredValue`). |
| **Language** | TypeScript | `^5.4.0` | Strict mode typing, generic interface definitions, zero `any` policy for enterprise safety. |
| **Build Engine** | Vite | `^5.2.0` | Lightning-fast HMR, Rollup production bundling, dynamic chunk splitting strategies. |
| **Client State** | Redux Toolkit | `^2.2.0` | Centralized global application state (Auth, Permissions, Preferences, UI Layouts). |
| **Server State** | TanStack React Query | `^5.28.0` | Server data fetching, caching, deduplication, optimistic updates, background polling. |
| **UI Components** | Material UI (MUI) | `^6.0.0` | DataGrid Pro, Date Pickers, Complex Dialogs, Steppers, Accessibility-first primitives. |
| **Utility Styling** | Vanilla CSS | N/A | Dynamic responsive layouts, glassmorphism UI components, custom utility tokens. |
| **Data Viz** | Recharts / D3.js | `^2.12.0` | High-performance SVG/Canvas charting (Line, Bar, Donut, Heatmaps, Scatter plots). |
| **Forms & Validation** | React Hook Form + Zod | `^7.51.0` | Uncontrolled high-performance forms with strict schema validation. |
| **Routing** | React Router | `^6.22.0` | Nested layout routes, code-split lazy loading, role-based guard middleware. |
| **HTTP Client** | Axios | `^1.6.0` | Global interceptors, JWT RS256 token refresh queues, automatic retry logic. |
| **Icons & Media** | Lucide React | `^0.350.0` | Lightweight, customizable SVG icon set. |

---

## 3. Enterprise Directory Structure & Modular Architecture

The application adopts a **Feature-First / Domain-Driven Modular Layout** ensuring strict separation of concerns, high reusability, and scale ready for multi-team engineering.

```
src/
├── app/                        # Application Bootstrap & Top-Level Providers
│   ├── App.tsx                 # Main Application Root Component
│   ├── AppProviders.tsx        # Redux, React Query, Theme, Router Providers
│   ├── router.tsx              # React Router Navigation Config & Guard Wrappers
│   └── store.ts                # Redux Toolkit Central Store Configuration
├── assets/                     # Static Media, Fonts, Global Images
│   ├── images/
│   ├── icons/
│   └── styles/
│       └── globals.css         # Global Styles & Base Theme Overrides
├── components/                 # Shared Generic UI Components (Atomic Layer)
│   ├── ui/                     # Pure UI Primitives (Buttons, Cards, Inputs, Modals)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── DataGrid/
│   │   └── KPICard/
│   ├── charts/                 # Reusable Chart Wrappers
│   │   ├── MetricLineChart.tsx
│   │   ├── DistributionDonut.tsx
│   │   └── AttendanceHeatmap.tsx
│   ├── layout/                 # Main Shell Layout Components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── PageHeader.tsx
│   └── feedback/               # Loaders, Toast Alerts, Error Boundaries
│       ├── ErrorBoundary.tsx
│       └── LoadingSkeleton.tsx
├── config/                     # Application Constants & Environment Variables
│   ├── env.config.ts
│   ├── constants.ts
│   └── rbac.config.ts          # Role Level Hierarchy Definitions
├── features/                   # Domain-Specific Feature Modules
│   ├── auth/                   # Login, Token Refresh, Password Reset
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── authSlice.ts
│   ├── dashboard/              # Executive & Role-Based Dashboards
│   │   ├── components/
│   │   ├── hooks/
│   │   └── views/
│   ├── employees/              # Employee Directory, Profiles, Lifecycle
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── employeeSlice.ts
│   ├── teams/                  # Team Rosters, Org Hierarchy, Activity
│   ├── analytics/              # Deep Workforce & Salary Analytics
│   ├── reports/                # Report Generator & Export Builder
│   └── admin/                  # System Admin, Role Matrix, Audit Logs
├── hooks/                      # Global Utility React Hooks
│   ├── useAuth.ts              # Authentication & User State Helper Hook
│   ├── usePermission.ts        # RBAC Permission Evaluation Hook
│   ├── useDebounce.ts          # Input Debounce Utility
│   └── useNotification.ts      # Global Toast Alert Hook
├── services/                   # Global API Clients & HTTP Interceptors
│   ├── api.client.ts           # Axios Core Instance
│   ├── auth.service.ts         # Auth API Requests
│   └── storage.service.ts      # LocalStorage & Cookie Management
├── types/                      # Global TypeScript Type Definitions
│   ├── auth.types.ts
│   ├── employee.types.ts
│   ├── analytics.types.ts
│   └── api.types.ts
└── utils/                      # Helper Pure Functions & Formatters
    ├── formatters.ts           # Currency, Date, Percentage Formatters
    ├── validators.ts           # Schema Validation Utilities
    └── crypto.ts               # In-Memory Encryption Utilities
```

---

## 4. Design System & Component Library Specifications

### 4.1 Color System & Design Tokens
The platform utilizes a dual-theme (Dark/Light Mode) system powered by HSL CSS Variables exposed to both custom styles and Material UI.

```css
:root {
  /* Brand Core Palette */
  --primary-50: 210 100% 97%;
  --primary-500: 217 91% 60%;  /* #2563EB - Royal Blue */
  --primary-700: 224 76% 48%;  /* #1D4ED8 */
  --primary-900: 226 71% 23%;  /* #1E3A8A */

  /* Neutral Dark Glass Theme Defaults */
  --bg-surface: 222 47% 11%;   /* Dark Slate #0F172A */
  --bg-card: 217 33% 17%;      /* Glass Card #1E293B */
  --text-primary: 210 40% 98%;
  --text-secondary: 215 20% 65%;
  --border-color: 215 25% 27%;

  /* Status Colors */
  --color-success: 142 71% 45%;  /* Emerald Green */
  --color-warning: 38 92% 50%;   /* Amber Orange */
  --color-danger: 346 87% 53%;   /* Crimson Red */
  --color-info: 199 89% 48%;     /* Cyan Blue */
}
```

### 4.2 Reusable Component Architecture Specifications

#### A. Executive KPI Card Component (`KPICard.tsx`)

```tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  changePercentage,
  trend,
  icon: Icon,
  subtitle,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-6 bg-slate-800/60 rounded-xl border border-slate-700/50 animate-pulse">
        <div className="h-4 w-24 bg-slate-700 rounded mb-3" />
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-3 w-40 bg-slate-700 rounded" />
      </div>
    );
  }

  const isPositive = trend === 'up';

  return (
    <div className="relative overflow-hidden p-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-lg hover:border-blue-500/50 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {isPositive ? '+' : ''}{changePercentage}%
        </span>
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
```

#### B. High-Performance Enterprise DataGrid Wrapper (`DataTable.tsx`)

```tsx
import React from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface DataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading: boolean;
  totalRows: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
}

export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  loading,
  totalRows,
  paginationModel,
  onPaginationChange,
}: DataTableProps<T>) {
  return (
    <div className="h-[600px] w-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={totalRows}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationChange}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          color: '#E2E8F0',
          '& .MuiDataGrid-cell': {
            borderColor: '#1E293B',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#0F172A',
            color: '#94A3B8',
            fontWeight: 600,
            borderBottom: '1px solid #1E293B',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#0F172A',
            borderColor: '#1E293B',
            color: '#94A3B8',
          },
        }}
      />
    </div>
  );
}
```

---

## 5. State Management Architecture (Redux Toolkit & React Query)

The platform splits state into two distinct strategies:
1. **Client Application State (Redux Toolkit):** Session storage, active role claims, dark/light theme, UI drawer states, and global modal queues.
2. **Server Async State (React Query):** Cached microservice API data, background refresh intervals, and mutation optimistic updates.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  [Header] [Sidebar] [Dashboard Layout] [KPI Cards] [Charts] [Tables]   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     REDUX TOOLKIT STORE       │             │   TANSTACK REACT QUERY V5     │
│   (Client Local State)        │             │    (Server Cached State)      │
├───────────────────────────────┤             ├───────────────────────────────┤
│ - authSlice (JWT, Role Level) │             │ - useWorkforceMetrics Query   │
│ - permissionSlice (Perms[])   │             │ - useEmployeeList Query       │
│ - themeSlice (Dark/Light)     │             │ - useTeamRoster Query         │
│ - uiSlice (Sidebar Collapse)  │             │ - useMutateAttendance Hook    │
└───────────────────────────────┘             └───────────────────────────────┘
```

### 5.1 Redux Auth Slice Implementation (`authSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleLevel: 1 | 2 | 3 | 4 | 5; // Level 1 (Admin) -> Level 5 (Employee)
  permissions: string[];
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  activeRoleLevel: number;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  activeRoleLevel: 5,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; token: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
      state.activeRoleLevel = action.payload.user.roleLevel;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.activeRoleLevel = 5;
      state.loading = false;
    },
    updateRoleLevel: (state, action: PayloadAction<number>) => {
      state.activeRoleLevel = action.payload;
    },
  },
});

export const { setCredentials, logout, updateRoleLevel } = authSlice.actions;
export default authSlice.reducer;
```

### 5.2 Server State Hook with React Query (`useWorkforceAnalytics.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../services/api.client';

export interface WorkforceKPIs {
  totalHeadcount: number;
  activeAttritionRate: number;
  monthlySalarySpend: number;
  productivityScore: number;
}

export const QUERY_KEYS = {
  workforceKPIs: ['analytics', 'workforce-kpis'] as const,
  employeeList: (page: number, limit: number) => ['employees', 'list', page, limit] as const,
};

// Fetch Workforce KPIs with 60-second stale time
export const useWorkforceKPIs = (roleLevel: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.workforceKPIs,
    queryFn: async (): Promise<WorkforceKPIs> => {
      const response = await axiosInstance.get('/api/analytics/workforce');
      return response.data;
    },
    staleTime: 60 * 1000,
    enabled: roleLevel <= 3, // Granted only for Level 1, 2, and 3
  });
};
```

---

## 6. Role-Based Access Control (RBAC) & Security Layer

The frontend enforces strict **Zero-Trust Access Scoping**. Unpermitted routes automatically trigger access redirection, while unauthorized UI buttons, action menus, and sensitive metric cards are hidden or rendered disabled.

```
Role Level 1: ADMIN          ──> Complete System Access & API Control
Role Level 2: HR MANAGER     ──> Org-Wide Employee & Salary Access
Role Level 3: TEAM MANAGER   ──> Assigned Team Rosters & Approvals
Role Level 4: TEAM LEAD      ──> Direct Activity & Standup Logs
Role Level 5: EMPLOYEE       ──> Personal Self-Service Dashboard Only
```

### 6.1 Protected Route Guard Component (`ProtectedRoute.tsx`)

```tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

interface ProtectedRouteProps {
  minRoleLevel: 1 | 2 | 3 | 4 | 5;
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  minRoleLevel,
  requiredPermissions = [],
}) => {
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white">Authenticating Session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce Role Level Check (Lower numeric value means higher privilege level)
  const hasRoleAccess = user.roleLevel <= minRoleLevel;

  // Enforce Granular Permission Check
  const hasPermissionAccess = requiredPermissions.every((perm) =>
    user.permissions.includes(perm)
  );

  if (!hasRoleAccess || !hasPermissionAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

### 6.2 Fine-Grained Component Authorization Wrapper (`HasPermission.tsx`)

```tsx
import React from 'react';
import { useAppSelector } from '../store';

interface HasPermissionProps {
  minLevel?: number;
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const HasPermission: React.FC<HasPermissionProps> = ({
  minLevel,
  permission,
  children,
  fallback = null,
}) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return <>{fallback}</>;

  const levelGranted = minLevel ? user.roleLevel <= minLevel : true;
  const permissionGranted = permission ? user.permissions.includes(permission) : true;

  if (levelGranted && permissionGranted) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
```

---

## 7. Feature Modules & UI Page Layout Specifications

### 7.1 Multi-Tier Dashboard Layout Engine
The main container dynamically resolves widgets based on the active authenticated user role.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP HEADER                                │
│ [Logo]  [Global Search]                 [Notifications] [User Profile] │
├───────────────────────────────┬────────────────────────────────────────┤
│                               │                                        │
│  SIDE NAVIGATION              │  MAIN WORKSPACE                        │
│  - Dashboard                  │  ┌──────────────────────────────────┐  │
│  - Employee Directory         │  │ Page Header & Role Indicator     │  │
│  - Teams & Org Structure      │  └──────────────────────────────────┘  │
│  - Workforce Analytics        │  ┌───────────┐ ┌───────────┐ ┌──────┐  │
│  - Attendance Logs            │  │ KPI Card 1│ │ KPI Card 2│ │ KPI3 │  │
│  - Reports & Exports          │  └───────────┘ └───────────┘ └──────┘  │
│  - System Settings            │  ┌──────────────────────────────────┐  │
│                               │  │ Primary Charting Canvas         │  │
│                               │  └──────────────────────────────────┘  │
│                               │  ┌──────────────────────────────────┐  │
│                               │  │ Data Grid / Active Roster       │  │
│                               │  └──────────────────────────────────┘  │
└───────────────────────────────┴────────────────────────────────────────┘
```

### 7.2 Core Feature Module Breakdown

#### A. Executive Dashboard Module (`/dashboard`)
* **KPI Metrics Strip:** Total Headcount, Monthly Attrition Rate, Total Payroll Cost (L1/L2 only), Average Productivity Score.
* **Workforce Growth Line Chart:** 12-month historical trend of hiring vs terminations.
* **Department Breakdown Donut Chart:** Headcount distribution across Engineering, Sales, HR, Product, and Finance.

#### B. Employee Directory & Lifecycle Module (`/employees`)
* **Paginated Server DataGrid:** Multi-column sorting, filtering by department, employment status, and location.
* **Employee Profile View Drawer:** Detailed personal information, salary tier (protected), performance ratings timeline, and attached documents.
* **Onboarding Stepper Form:** 4-step wizard for adding new workforce members (Personal Info → Job Role → Salary & Compensation → Account Credentials).

#### C. Workforce Analytics & Salary Intelligence (`/analytics`)
* **Salary Band Distribution Histogram:** Visual analysis of compensation brackets across job roles.
* **Gender & Diversity Metrics Ratio:** Interactive pie chart breaking down workforce diversity.
* **Performance vs Compensation Scatter Plot:** Identifies top-performing vs under-compensated staff.

---

## 8. API Integration Layer & HTTP Network Architecture

The application communicates with backend microservices through a centralized Axios singleton featuring automatic request tracing headers, global error catching, and dynamic token rotation.

```
[ Frontend HTTP Call ]
        │
        v
[ Axios Request Interceptor ] ──> Injects: `Authorization: Bearer <token>`
        │                                  `X-Trace-ID: <uuid>`
        v
[ Ingress API Gateway (Kong) ]
        │
        ├── ( HTTP 200 OK ) ─────────> [ Return Parsed Response Data ]
        │
        └── ( HTTP 401 Unauthorized )
                │
                v
        [ Axios Response Interceptor ]
                │
                v
        [ Execute Token Refresh Queue ] ──( POST /api/auth/refresh )
                │
                ├── ( Refresh Success ) ──> Save New Token & Retry Original Request
                │
                └── ( Refresh Failure ) ──> Clear Auth State & Redirect to `/login`
```

### 8.1 Centralized Axios Client (`api.client.ts`)

```typescript
import axios from 'axios';
import { store } from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for httpOnly Refresh Cookie
});

// Request Interceptor: Attach JWT Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Inject OpenTelemetry Trace ID for microservice tracing
    config.headers['X-Trace-ID'] = crypto.randomUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry & Automatic Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.accessToken;
        store.dispatch(setCredentials({ user: data.user, token: newAccessToken }));

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 9. Data Visualization Engine (Recharts & D3 Integration)

Data visualization components are isolated inside reusable wrappers equipped with responsive containers, tooltip formatters, and dark-theme color mappings.

### 9.1 Monthly Headcount Trend Chart (`WorkforceGrowthChart.tsx`)

```tsx
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartDataPoint {
  month: string;
  headcount: number;
  attrition: number;
}

interface WorkforceGrowthChartProps {
  data: ChartDataPoint[];
}

export const WorkforceGrowthChart: React.FC<WorkforceGrowthChartProps> = ({ data }) => {
  return (
    <div className="h-80 w-full bg-slate-900/80 p-5 rounded-xl border border-slate-800">
      <h3 className="text-base font-semibold text-white mb-4">Workforce Headcount & Attrition Trends</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Area
            type="monotone"
            dataKey="headcount"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHeadcount)"
            name="Total Headcount"
          />
          <Area
            type="monotone"
            dataKey="attrition"
            stroke="#F43F5E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAttrition)"
            name="Terminations"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## 10. Form Architecture & Dynamic Validation Engine

Forms leverage **React Hook Form** for uncontrolled DOM rendering performance coupled with **Zod** schema compilation for robust validation.

### 10.1 Employee Creation Form Schema & Implementation (`EmployeeForm.tsx`)

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid business email address'),
  departmentId: z.string().min(1, 'Please select a department'),
  joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid joining date'),
  baseSalary: z.number().positive('Salary must be a positive number'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  isSubmitting?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
        <input
          {...register('firstName')}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Work Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : 'Register Workforce Member'}
      </button>
    </form>
  );
};
```

---

## 11. Performance Optimization, Caching & Web Vitals Strategy

### 11.1 Target Core Web Vitals (CWV) SLAs
* **Largest Contentful Paint (LCP):** `< 1.2s`
* **Interaction to Next Paint (INP):** `< 90ms`
* **Cumulative Layout Shift (CLS):** `< 0.02`

### 11.2 Optimization Strategies
1. **Dynamic Code Splitting:** Pages and major feature modules are split at the router boundary using `React.lazy()` and `Suspense`.
2. **Virtualized Data Lists:** Lists exceeding 50 items utilize MUI DataGrid Pro virtualization to prevent DOM memory bloat.
3. **Memoization Guidelines:** Pure mathematical aggregations for charts are memoized using `useMemo()`. Callbacks passed to heavy data tables use `useCallback()`.

```tsx
// Router-Level Lazy Code Splitting Example
import { lazy, Suspense } from 'react';

const WorkforceAnalyticsView = lazy(() => import('../features/analytics/views/AnalyticsView'));

export const AnalyticsRoute = () => (
  <Suspense fallback={<div className="p-8 text-slate-400">Loading Analytics Module...</div>}>
    <WorkforceAnalyticsView />
  </Suspense>
);
```

---

## 12. Accessibility (a11y), Internationalization (i18n) & Theme Engine

### 12.1 Accessibility Standards
* **WCAG 2.1 Level AA Compliance:** Mandatory screen reader `aria-label` attributes on icon buttons.
* **Keyboard Navigation:** Full focus trap support in modals, drawer dialogs, and dropdown menus.
* **Color Contrast:** All text tokens maintain a minimum contrast ratio of `4.5:1` against dark slate card backgrounds.

### 12.2 Internationalization Setup (i18next)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to Workforce Intelligence',
        total_headcount: 'Total Headcount',
      },
    },
    es: {
      translation: {
        welcome: 'Bienvenido a Inteligencia de Personal',
        total_headcount: 'Plantilla Total',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

---

## 13. Frontend Testing Strategy & Quality Assurance

The application uses a **Three-Tier Testing Pyramid**:

```
                  ┌───────────────────────────────┐
                  │    E2E Tests (Playwright)     │
                  ├───────────────────────────────┤
                  │ Integration Tests (Vitest + RTL)│
                  ├───────────────────────────────┤
                  │ Unit Tests & Component Specs  │
                  └───────────────────────────────┘
```

### 13.1 Vitest Unit Test for Auth Guard (`ProtectedRoute.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../components/ProtectedRoute';
import authReducer from '../features/auth/authSlice';

const renderWithAuth = (roleLevel: number, isAuthenticated: boolean) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: isAuthenticated
          ? { id: '1', email: 'admin@corp.com', firstName: 'Admin', lastName: 'User', roleId: 'r1', roleLevel, permissions: [] }
          : null,
        accessToken: isAuthenticated ? 'fake-jwt' : null,
        isAuthenticated,
        activeRoleLevel: roleLevel,
        loading: false,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute minRoleLevel={1} />}>
            <Route path="/admin" element={<div>Admin Secret Area</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute RBAC Security', () => {
  it('redirects unauthenticated users to /login', () => {
    renderWithAuth(5, false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('blocks Level 5 Employee from Level 1 Admin Route', () => {
    renderWithAuth(5, true);
    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
  });

  it('grants Level 1 Admin access to Level 1 Route', () => {
    renderWithAuth(1, true);
    expect(screen.getByText('Admin Secret Area')).toBeInTheDocument();
  });
});
```

---

## 14. Build Pipeline, Docker Containerization & CI/CD Deployment

### 14.1 Production Multi-Stage Dockerfile (`Dockerfile`)

```dockerfile
# Stage 1: Build Production Bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via High-Performance Nginx
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 14.2 Nginx Static SPA Routing Config (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Long-Term Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 15. Appendix & Developer Onboarding Guide

### 15.1 Local Development Quickstart

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone https://github.com/enterprise/workforce-analytics-ui.git
   cd workforce-analytics-ui
   npm install
   ```

2. **Configure Environment Variables (`.env.local`):**
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_ENABLE_MOCK_API=false
   VITE_APP_TITLE=Workforce Analytics Platform
   ```

3. **Launch Vite Local Dev Server:**
   ```bash
   npm run dev
   ```
   *Application will launch locally at `http://localhost:5173`.*

4. **Run Quality Assurance Checks:**
   ```bash
   npm run typecheck    # Run TypeScript Compiler Diagnostics
   npm run lint         # Run ESLint Code Quality Rules
   npm run test         # Execute Vitest Suite
   ```

---
**End of Frontend Architectural & Engineering Documentation Manual**
