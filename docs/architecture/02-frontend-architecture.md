# 💻 Frontend Architecture

This document describes the design of the React SPA including navigation routing, component layouts, state management layers, custom theme layers, and real-time updates.

## 1. Frontend Component Structure

```mermaid
flowchart TB
    USER["Authenticated User"]
    subgraph APP["React Application"]
        ENTRY["main.tsx Application Entry"]
        APPROOT["App.tsx Application Root"]
        ROUTER["React Router Route Configuration"]
        GUARDS["Protected Routes (Role Guards / Permission Guards)"]
        LAYOUT["Enterprise Layout"]
        HEADER["Header"]
        SIDEBAR["Role-Based Sidebar"]
        CONTENT["Dashboard Content"]
        subgraph STATE_LAYER["State Management"]
            REDUX["Redux Toolkit (Auth / User / UI State)"]
            QUERY["TanStack React Query (API State / Cache)"]
        end
        subgraph UI_LAYER["Reusable UI Components"]
            KPI["KPI Cards"]
            TABLE["Employee Tables"]
            FILTERS["Dashboard Filters"]
            CHARTS["Recharts"]
            FORMS["Forms / Modals"]
            NOTIFICATIONS["Notification UI"]
        end
        subgraph ROLE_LAYER["Role Dashboards"]
            ADMIN["Admin Dashboard"]
            HR["HR Dashboard"]
            MANAGER["Manager Dashboard"]
            LEAD["Team Lead Dashboard"]
            EMPLOYEE["Employee Dashboard"]
        end
        subgraph ATTENDANCE["Attendance Module"]
            CHECKIN["Check-In"]
            BREAK["Break"]
            RESUME["Resume"]
            CHECKOUT["Check-Out"]
            HISTORY["Attendance History"]
            CORRECTION["Correction Request"]
            OFFLINE["Offline Queue"]
        end
        THEME["Theme System (Light / Dark)"]
        API_CLIENT["REST API Client (Axios)"]
        SOCKET["Socket.IO Client"]
    end
    USER --> ENTRY
    ENTRY --> APPROOT
    APPROOT --> ROUTER
    ROUTER --> GUARDS
    GUARDS --> LAYOUT
    LAYOUT --> HEADER
    LAYOUT --> SIDEBAR
    LAYOUT --> CONTENT
    GUARDS --> ADMIN
    GUARDS --> HR
    GUARDS --> MANAGER
    GUARDS --> LEAD
    GUARDS --> EMPLOYEE
    CONTENT --> STATE_LAYER
    REDUX --> API_CLIENT
    QUERY --> API_CLIENT
    API_CLIENT --> ROLE_LAYER
    API_CLIENT --> ATTENDANCE
    ROLE_LAYER --> UI_LAYER
    ATTENDANCE --> UI_LAYER
    OFFLINE --> API_CLIENT
    THEME --> LAYOUT
    THEME --> UI_LAYER
    SOCKET --> CONTENT
    SOCKET --> NOTIFICATIONS
```

---

## 2. Frontend Role-Based Routing

```mermaid
flowchart LR
    LOGIN["Login / MFA"] --> AUTH["Authenticated Session"]
    AUTH --> ROLE{"User Role"}
    ROLE -->|ADMIN| ADMIN["/admin/dashboard"]
    ROLE -->|HR| HR["/hr/dashboard"]
    ROLE -->|MANAGER| MANAGER["/manager/dashboard"]
    ROLE -->|TEAM_LEAD| LEAD["/team-lead/dashboard"]
    ROLE -->|EMPLOYEE| EMP["/employee/dashboard"]
    ADMIN --> ADMIN_NAV["Admin Navigation"]
    HR --> HR_NAV["HR Navigation"]
    MANAGER --> MGR_NAV["Manager Navigation"]
    LEAD --> LEAD_NAV["Team Lead Navigation"]
    EMP --> EMP_NAV["Employee Navigation"]
```
