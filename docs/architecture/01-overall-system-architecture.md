# 🌐 Overall Full-Stack System Architecture

This diagram illustrates the overall system architecture of the Workforce Analytics Platform, depicting the separation from the presentation views down to backend routing, security middleware, services, and the SQLite persistence layer.

```mermaid
flowchart TB
    USER["Users (ADMIN, HR, MANAGER, TEAM LEAD, EMPLOYEE)"]
    
    subgraph FRONTEND["FRONTEND — React + TypeScript"]
        UI["Role-Based UI"]
        ROUTER["React Router Protected Routes"]
        STATE["Redux Toolkit Authentication / UI State"]
        QUERY["TanStack React Query Server State / API Cache"]
        COMPONENTS["Reusable Components (KPI Cards / Tables / Charts)"]
        ANALYTICS_UI["Analytics (Recharts)"]
        ATTENDANCE_UI["Attendance (Check-In / Break / Resume / Check-Out)"]
        SOCKET_CLIENT["Socket.IO Client Real-Time Updates"]
    end
    
    subgraph BACKEND["BACKEND — Node.js + Express"]
        API["REST API"]
        AUTH["Authentication (JWT + Refresh Token + MFA)"]
        AUTHZ["Authorization (RBAC + ABAC + Policy)"]
        CONTROLLERS["Controllers"]
        SERVICES["Business Services"]
        VALIDATION["Validation + Security Middleware"]
        SOCKET["Socket.IO Server"]
        NOTIFICATION["Notification Service"]
        AUDIT["Audit Service"]
    end
    
    subgraph DATABASE["DATABASE — SQLite / SQLite Cloud"]
        USERS["Users / Roles / Permissions"]
        EMP["Employees"]
        ORG["Organizations / Departments / Teams"]
        ATT["Attendance"]
        CORR["Attendance Corrections"]
        MFA["MFA Challenges"]
        SESSION["Sessions / Refresh Tokens"]
        NOTIFY["Notifications"]
        AUDITDB["Audit Logs"]
    end
    
    USER --> UI
    UI --> ROUTER
    ROUTER --> STATE
    ROUTER --> QUERY
    QUERY --> API
    STATE --> API
    API --> VALIDATION
    VALIDATION --> AUTH
    AUTH --> AUTHZ
    AUTHZ --> CONTROLLERS
    CONTROLLERS --> SERVICES
    
    SERVICES --> USERS
    SERVICES --> EMP
    SERVICES --> ORG
    SERVICES --> ATT
    SERVICES --> CORR
    SERVICES --> MFA
    SERVICES --> SESSION
    SERVICES --> NOTIFY
    SERVICES --> AUDITDB
    
    SERVICES --> SOCKET
    SOCKET --> SOCKET_CLIENT
    SOCKET_CLIENT --> UI
    SERVICES --> NOTIFICATION
    SERVICES --> AUDIT
    
    ANALYTICS_UI --> QUERY
    ATTENDANCE_UI --> QUERY
```

---

### Core Architecture Description
1. **Presentation Layer (Frontend)**: Structured as a React SPA with Vite, routing handles role guards and permission checks. TanStack React Query handles network states while Redux manages local state (e.g. active check-in profiles, auth, sidebar).
2. **API & Security (Backend)**: Express API routes requests through authentication (JWT validation) and authorization (RBAC and DBAC checking) middleware.
3. **Database (SQLite)**: Persists relational tables with strict schemas, relational foreign key constraints, and query optimization via indexes.
