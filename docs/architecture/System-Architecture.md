# Enterprise Workforce Analytics Intelligence Platform
## System Architecture Specification & Step-by-Step Breakdown
**Prepared By:** Maheswari Pinneti, Frontend Developer  

---

### Step 1: High-Level System Context (C4 Model - Level 1)

This level defines the system boundary, primary user roles (actors), security layer, core platform container, and external enterprise system integrations.

```
+---------------------------------------------------------------------------------------------------+
|                                          SYSTEM ACTORS                                            |
|                                                                                                   |
|   1. ADMIN          2. HR MANAGER      3. TEAM MANAGER      4. TEAM LEAD       5. EMPLOYEE        |
|   (Level 1)          (Level 2)          (Level 3)           (Level 4)          (Level 5)         |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                      [ HTTPS / TLS 1.3 / WSS ]
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                 CENTRALIZED RBAC SECURITY LAYER                                   |
|   - Authentication Service (Login, Password Hashing)                                             |
|   - Token Management (JWT RS256 Access & Refresh Tokens)                                         |
|   - Authorization Engine (Policy Enforcement Point - PEP / Policy Decision Point - PDP)           |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                            WORKFORCE ANALYTICS INTELLIGENCE PLATFORM                              |
|   - Web Application Frontend (React 19 + Redux Toolkit + React Query)                             |
|   - Ingress API Gateway (Kong / Nginx)                                                            |
|   - 7 Microservices (Auth, User, Employee, Team, Analytics, Report, Notification)                 |
|   - Event Bus (Apache Kafka / RabbitMQ)                                                           |
|   - Databases & Storage (PostgreSQL Multi-DB, Redis Cache, AWS S3)                                |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                      [ gRPC / REST / SMTP / S3 ]
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                    EXTERNAL ENTERPRISE SERVICES                                   |
|                                                                                                   |
|   - Identity Provider (Okta / Azure AD via SAML 2.0 / OIDC)                                      |
|   - Email Notification System (SMTP / AWS SES)                                                   |
|   - Enterprise File Storage (AWS S3 Bucket)                                                      |
|   - Enterprise Reporting System (PowerBI / Tableau / Data Warehouse Sync)                        |
+---------------------------------------------------------------------------------------------------+
```

---

### Step 2: Role-Based Access Control (RBAC) Architecture

A centralized 5-tier role hierarchy enforcing the zero-trust principle of least privilege:

```
                  ┌───────────────────────────────┐
                  │    LEVEL 1: ADMIN (Super)     │
                  ├───────────────────────────────┤
                  │ LEVEL 2: HR MANAGER           │
                  ├───────────────────────────────┤
                  │ LEVEL 3: TEAM MANAGER         │
                  ├───────────────────────────────┤
                  │ LEVEL 4: TEAM LEAD            │
                  ├───────────────────────────────┤
                  │ LEVEL 5: EMPLOYEE             │
                  └───────────────────────────────┘
```

#### Detailed Privilege Matrix

| Role Level | Role Name | System Access & Granted Privileges | Granted Permissions | Allowed API Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | **ADMIN** | Complete system administration, user management, role/permission assignment, org structural config, access to all employee data across org, system settings. | `sys:admin`, `users:*`, `roles:*`, `org:*`, `employees:*`, `settings:*` | `/api/auth/*`<br>`/api/users/*`<br>`/api/employees/*`<br>`/api/teams/*`<br>`/api/analytics/*`<br>`/api/reports/*` |
| **Level 2** | **HR MANAGER** | Employee lifecycle management (onboarding to offboarding), employee CRUD, org-wide attendance management, profile management, workforce analytics, salary info, performance reports. | `hr:manage`, `employees:write`, `attendance:org_read`, `salary:read`, `analytics:org_read` | `/api/employees/*`<br>`/api/teams`<br>`/api/analytics/workforce`<br>`/api/analytics/salary`<br>`/api/reports/hr` |
| **Level 3** | **TEAM MANAGER** | Assigned team management, team analytics, team attendance, team performance tracking, leave & reimbursement approvals, custom team reports. | `team:manage`, `team:analytics`, `attendance:team_read`, `approval:write` | `/api/teams/{id}/*`<br>`/api/employees/team/{id}`<br>`/api/analytics/team/{id}`<br>`/api/reports/team` |
| **Level 4** | **TEAM LEAD** | Direct team member visibility, daily activity monitoring, productivity tracking, team status updates, limited team analytics. | `team:read`, `activity:monitor`, `productivity:read`, `status:update` | `/api/teams/{id}/members`<br>`/api/analytics/productivity`<br>`/api/reports/daily-standup` |
| **Level 5** | **EMPLOYEE** | Personal self-service dashboard, personal profile update, own attendance clocking, own performance review tracking, request submission (leave/helpdesk). | `self:read`, `self:write`, `attendance:self`, `requests:submit` | `/api/employees/me`<br>`/api/attendance/me`<br>`/api/analytics/me`<br>`/api/requests/me` |

---

### Step 3: Security & Authentication Architecture

#### Core Security Components
- **Login Service:** Processes authentication requests and verifies Argon2id salted password hashes.
- **JWT Token Generator:** Issues asymmetric RS256 signed Access Tokens (15 min TTL) and Refresh Tokens (7 days TTL).
- **Refresh Token Service:** Rotates refresh tokens and maintains blacklisted tokens in Redis.
- **Password Encryption Engine:** Uses Argon2id key derivation to prevent GPU brute-force attacks.
- **Session Management:** Tracks active user sessions and concurrent login limits in Redis.
- **Policy Decision Point (PDP):** Evaluates user claims against requested resource permission rules.
- **Policy Enforcement Point (PEP):** API Gateway middleware that intercepts requests and blocks unauthorized calls.

#### End-to-End Security Flow

```
[ User Login Request ]
        │
        v
[ Authentication Service ] ──( Verify Argon2 Hash in User DB )
        │
        v
[ Issue JWT RS256 Token ] ──( Claims: userId, roleId, level: 1-5, perms[] )
        │
        v
[ Client Token Storage ] ──( Access Token in Memory | Refresh Token in httpOnly Cookie )
        │
        v
[ API Request with Bearer Token ]
        │
        v
[ API Gateway JWT Validation ] ──( Verify RS256 Public Key Signature & Expiry )
        │
        v
[ PEP / PDP RBAC Check ] ──( Match User Role Level vs Endpoint Min Required Level )
        │
        ├── ( Granted ) ──> Route to Microservice ──> [ 200 OK Response ]
        │
        └── ( Denied ) ───> Return Security Exception ──> [ 403 Forbidden ]
```

---

### Step 4: Frontend Architecture & State Store

#### Tech Stack
- **Core:** React 19, TypeScript, Vite
- **UI Components:** Material UI (MUI), Lucide Icons
- **State Management:** Redux Toolkit (central state), React Query (server state & caching)
- **Data Visualization:** Recharts (Line Charts, Bar Charts, Donut Charts, Sparklines)

#### Frontend Layer Architecture & Redux Slices

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  [Header] [Sidebar] [Dashboard Layout] [KPI Cards] [Charts] [Tables]   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                         ROLE-BASED MODULES                             │
│  [Admin Mod.]   [HR Mod.]   [Manager Mod.]   [Lead Mod.]   [Emp Mod.]  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                      REDUX TOOLKIT CENTRAL STORE                       │
│  - authSlice       : User credentials, JWT token, active role level   │
│  - permissionSlice : Granted permissions array, domain scopes          │
│  - employeeSlice   : Employee data lists, selected profiles, filters   │
│  - dashboardSlice  : Calculated KPI metrics, trend charts data         │
│  - teamSlice       : Assigned team rosters, member status logs         │
│  - themeSlice      : Dark/Light theme mode, UI sidebar collapse        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                   REACT QUERY DATA FETCHING LAYER                      │
│  - Server State Cache  - Background Polling  - Axios API Client        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Step 5: API Gateway Architecture

The API Gateway acts as the single entry point (Ingress Router) for all client traffic.

#### Key Responsibilities
- **Request Routing:** Routes incoming HTTP/WSS requests to target microservices.
- **Authentication Validation:** Validates JWT token signatures at the ingress edge.
- **Rate Limiting:** Throttles incoming client requests per IP/role (e.g., 60–300 req/min).
- **Logging & Tracing:** Injects OpenTelemetry trace IDs into HTTP headers for distributed tracing.
- **CORS & TLS Termination:** Handles SSL/TLS 1.3 handshakes and CORS policies centrally.

#### Gateway Route Mapping Table

| Route Path | Microservice Target | Allowed Methods | Min Role Level Required | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/*` | Authentication Service | `POST` | Level 5 (Public/Authenticated) | 10 req/min |
| `/api/users/*` | User Management Service | `GET`, `POST`, `PUT`, `DELETE` | Level 1 (ADMIN) | 60 req/min |
| `/api/employees/*` | Employee Service | `GET`, `POST`, `PUT` | Level 2 (HR MANAGER) | 120 req/min |
| `/api/teams/*` | Team Management Service | `GET`, `POST`, `PUT` | Level 3 (TEAM MANAGER) | 120 req/min |
| `/api/analytics/*` | Analytics Service | `GET` | Level 4 (TEAM LEAD) / L2 for Org | 150 req/min |
| `/api/reports/*` | Reporting Service | `GET`, `POST` | Level 3 (TEAM MANAGER) | 20 req/min |

---

### Step 6: Backend Microservices Architecture

7 decoupled microservices with database-per-service isolation and gRPC/REST inter-service communication:

```
┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
│ 1. Authentication Service │    │ 2. User Management Service│    │ 3. Employee Service       │
│ Port: 8081                │    │ Port: 8082                │    │ Port: 8083                │
│ DB: User DB (auth schema) │    │ DB: User DB (rbac schema) │    │ DB: Employee DB           │
│ Stack: Go / Spring Boot   │    │ Stack: Node.js / TS       │    │ Stack: Java Spring Boot   │
└─────────────┬─────────────┘    └─────────────┬─────────────┘    └─────────────┬─────────────┘
              │                                │                                │
              └────────────────────────────────┼────────────────────────────────┘
                                               │
                                               v
┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
│ 4. Team Service           │    │ 5. Analytics Service      │    │ 6. Reporting Service      │
│ Port: 8084                │    │ Port: 8085                │    │ Port: 8086                │
│ DB: Employee DB (teams)   │    │ DB: Analytics DB          │    │ DB: S3 Object Store       │
│ Stack: Go / Fiber         │    │ Stack: Python FastAPI     │    │ Stack: Node.js + Puppeteer│
└─────────────┬─────────────┘    └─────────────┬─────────────┘    └─────────────┬─────────────┘
              │                                │                                │
              └────────────────────────────────┼────────────────────────────────┘
                                               │
                                               v
                                 ┌───────────────────────────┐
                                 │ 7. Notification Service   │
                                 │ Port: 8087                │
                                 │ DB: Redis Queue           │
                                 │ Stack: Node.js + AWS SES  │
                                 └───────────────────────────┘
```

---

### Step 7: Database & Cache Architecture

#### 1. PostgreSQL Primary Relational Databases

* **User Database (`user_db`):**
  - `users`: `id`, `username`, `email`, `password_hash`, `status`, `created_at`
  - `roles`: `id`, `role_name`, `description`, `level`
  - `permissions`: `id`, `perm_code`, `domain`
  - `role_permissions`: `role_id`, `permission_id`

* **Employee Database (`employee_db`):**
  - `employees`: `id`, `user_id`, `first_name`, `last_name`, `dept_id`, `location_id`, `joining_date`, `status`
  - `departments`: `id`, `name`, `code`, `manager_id`
  - `locations`: `id`, `office_name`, `country`, `city`
  - `attendance`: `id`, `employee_id`, `clock_in`, `clock_out`, `status`
  - `performance`: `id`, `employee_id`, `review_period`, `rating`, `feedback`
  - `salary`: `id`, `employee_id`, `base_salary`, `currency` *(Confidential: L1/L2 access only)*

* **Analytics Database (`analytics_db`):**
  - `kpi_metrics`: `id`, `metric_name`, `metric_value`, `calculated_at`
  - `workforce_trends`: `id`, `snapshot_date`, `headcount`, `attrition_rate`
  - `reports`: `id`, `title`, `file_s3_key`, `generated_by`

#### 2. Redis Cache Cluster Layer
- **Session Caching:** Stores user session state & MFA validation tokens (30 min TTL).
- **API Response Caching:** Caches aggregated workforce metrics to ensure sub-50ms dashboard loads.
- **Rate Limit Counters:** Maintains sliding window request rate counts per client IP/user.

#### 3. Object Storage (AWS S3)
Stores generated PDF reports, exported CSV files, employee profile images, and encrypted contract documents using AES-256 server-side encryption.

---

### Step 8: Event-Driven Architecture (Kafka / RabbitMQ)

Asynchronous pub/sub messaging decouples microservices and powers real-time background processing:

```
[ Employee Service ] ────> ( Event: EmployeeCreated ) ──┐
                                                         ├──> [ User Management Service ]
[ Attendance Service ] ──> ( Event: AttendanceUpdated ) ─┼──> [ Analytics Service ]
                                                         ├──> [ Notification Service ]
[ Reporting Service ] ───> ( Event: ReportGenerated )  ──┘──> [ Reporting Service ]
```

#### Event Topics & Consumers Table

| Topic Name | Event Type | Publisher Service | Consumer Services | Payload Content |
| :--- | :--- | :--- | :--- | :--- |
| `employee-created-topic` | `EmployeeCreated` | Employee Service | User Service, Analytics Service, Notification Service | `employeeId`, `email`, `departmentId`, `role` |
| `employee-updated-topic` | `EmployeeUpdated` | Employee Service | Team Service, Analytics Service | `employeeId`, `updatedFields`, `newDeptId` |
| `attendance-updated-topic` | `AttendanceUpdated` | Employee Service | Analytics Service, Reporting Service | `employeeId`, `clockInTime`, `status` |
| `report-generated-topic` | `ReportGenerated` | Reporting Service | Notification Service | `reportId`, `downloadUrl`, `requestedBy` |

---

### Step 9: Cloud Deployment Architecture (AWS Native)

Deployed on Amazon Web Services (AWS) using Multi-Availability Zone (Multi-AZ) container orchestration:

```
                                  [ USERS & CLIENT BROWSERS ]
                                               │
                                     [ Route 53 DNS / HTTPS ]
                                               v
+---------------------------------------------------------------------------------------------------+
| AWS PUBLIC SUBNET (ZONE A, B, C)                                                                  |
|   - AWS CloudFront CDN (Static UI Assets)                                                         |
|   - AWS WAF (Web Application Firewall - SQLi, XSS Protection)                                     |
|   - AWS Application Load Balancer (ALB)                                                           |
+---------------------------------------------------------------------------------------------------+
                                               │
                                               v
+---------------------------------------------------------------------------------------------------+
| AWS PRIVATE APP SUBNET (EKS KUBERNETES CLUSTER)                                                   |
|   - Kong API Gateway Pods (3x Replicas)                                                           |
|   - 7 Microservices Pod Containers (HPA Auto-scaling)                                             |
|   - Apache Kafka MSK Cluster (3 Broker Nodes)                                                     |
+---------------------------------------------------------------------------------------------------+
                                               │
                                               v
+---------------------------------------------------------------------------------------------------+
| AWS PRIVATE DATA SUBNET                                                                           |
|   - Amazon RDS PostgreSQL Multi-AZ Cluster (Primary + Standby Replica)                           |
|   - Amazon ElastiCache Redis Cluster (3 Shards)                                                   |
|   - Amazon S3 Object Storage Bucket (AES-256 Server-Side Encryption)                             |
+---------------------------------------------------------------------------------------------------+
```

---

### Step 10: Network Architecture & Security Boundaries

- **Public Network Tier:**
  - **Components:** CloudFront CDN, AWS WAF, Application Load Balancer (ALB).
  - **Protection:** DDoS mitigation, TLS 1.3 termination, rate-limiting ingress rules.
- **Private Application Tier:**
  - **Components:** Kubernetes Worker Nodes (EKS), Microservice Pods, Kafka Cluster.
  - **Protection:** NAT Gateways (no public IP addresses), Security Groups restricting traffic solely to ALB requests.
- **Private Database Tier:**
  - **Components:** RDS PostgreSQL, ElastiCache Redis.
  - **Protection:** Non-routable subnets, port-level firewall rules, encrypted disk volumes (KMS).

---

### Step 11: Monitoring & Observability Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY STACK                             │
│                                                                        │
│  1. METRICS      : Prometheus scraping microservice metrics & CPU/Mem │
│  2. DASHBOARDS   : Grafana real-time system performance visualization │
│  3. LOGGING      : ELK Stack (Logstash -> Elasticsearch -> Kibana)     │
│  4. CLOUD ALERTS : AWS CloudWatch + PagerDuty integration              │
└────────────────────────────────────────────────────────────────────────┘
```

- **Application Monitoring:** APM tracing (OpenTelemetry), error tracking, request latency SLA tracking (sub-100ms goal).
- **Infrastructure Monitoring:** CPU utilization, memory pressure, database IOPS, disk throughput.
- **Audit Logging:** Immutable security audit logs recording every login, role change, and sensitive data access event.
