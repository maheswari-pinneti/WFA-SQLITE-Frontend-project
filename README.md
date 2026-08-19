# WFA-SQLITE-Frontend-project

## Workforce Analytics Platform

A full-stack **Workforce Analytics application** designed to manage employees, attendance, workforce information, organizational data, role-based access, and workforce analytics using a modern React frontend, Express backend, and SQLite database.

The application is designed with a focus on **maintainability, security, testing, performance, observability, deployment, and production readiness**.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Application Architecture](#application-architecture)
* [Role-Based Access Control](#role-based-access-control)
* [Engineering Areas](#engineering-areas)
* [Database](#database)
* [Backend Structure](#backend-structure)
* [Frontend Structure](#frontend-structure)
* [API Integration](#api-integration)
* [Authentication and Security](#authentication-and-security)
* [Testing and Quality Assurance](#testing-and-quality-assurance)
* [Performance](#performance)
* [Mobile Testing](#mobile-testing)
* [DevOps and CI/CD](#devops-and-cicd)
* [Cloud and Deployment](#cloud-and-deployment)
* [Monitoring and Alerting](#monitoring-and-alerting)
* [Analytics](#analytics)
* [Documentation and Knowledge Sharing](#documentation-and-knowledge-sharing)
* [Release Management](#release-management)
* [Development Workflow](#development-workflow)
* [Environment Configuration](#environment-configuration)
* [Getting Started](#getting-started)
* [Troubleshooting](#troubleshooting)
* [Future Improvements](#future-improvements)
* [License](#license)

---

## Project Overview

The **Workforce Analytics Platform** provides a centralized system for managing workforce-related information and analyzing employee and attendance data.

The platform follows a full-stack architecture:

```text
React + TypeScript
        |
        | REST API
        v
Node.js + Express
        |
        v
Service / Controller / Repository Layer
        |
        v
SQLite Database
```

The system is designed to support:

* Employee management
* Workforce management
* Attendance management
* Authentication
* Role-based access control
* Workforce analytics
* Dashboard reporting
* Organization management
* Audit logging
* Data validation
* API integration
* Testing
* Monitoring
* Production deployment

---

# Key Features

## Authentication

* User login
* User signup
* Secure password handling
* Authentication middleware
* Session/token management
* Logout
* Authentication validation
* Protected routes

## Role-Based Access Control

The application supports role-based access to workforce functionality.

Supported roles include:

* ADMIN
* HR MANAGER
* TEAM MANAGER
* TEAM LEAD
* EMPLOYEE

Permissions are applied at both the frontend and backend levels.

## Employee Management

* Employee creation
* Employee listing
* Employee details
* Employee updates
* Employee deletion where authorized
* Employee search
* Employee filtering
* Department filtering
* Role filtering
* Organization-based employee management

## Attendance Management

* Check-in
* Break
* Resume
* Check-out
* Attendance history
* Attendance status
* Attendance validation
* Attendance reporting
* Attendance analytics

## Workforce Analytics

* Workforce KPIs
* Employee analytics
* Attendance analytics
* Department analytics
* Role analytics
* Workforce trends
* Performance analytics
* Salary analytics
* Location analytics
* Employee growth analytics
* Dashboard reporting

## Organization Management

* Organization information
* Organization-level data separation
* Workforce organization mapping
* Organization-based access control

## Audit and Operational Logging

* User activity tracking
* API logging
* Authentication event logging
* Error logging
* Operational diagnostics
* Audit history

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* Redux Toolkit
* TanStack React Query
* Material UI
* Tailwind CSS
* Recharts

## Backend

* Node.js
* Express.js
* REST APIs
* JavaScript / TypeScript modules
* Middleware-based architecture

## Database

* SQLite
* SQL schema
* Database constraints
* Transactions
* Indexes
* Seed data
* Test database

## Development and Testing

* Git
* GitHub
* ESLint
* Unit testing
* Integration testing
* API testing
* Regression testing
* Performance testing

---

# Application Architecture

The application follows a layered architecture.

```text
+------------------------------------------------+
|                React Frontend                  |
|                                                |
|  Pages | Components | Redux | React Query     |
|  Forms | Charts | Tables | Filters             |
+-------------------------+----------------------+
                          |
                          | HTTPS / REST API
                          v
+------------------------------------------------+
|                Express Backend                 |
|                                                |
| Routes → Middleware → Controllers → Services   |
+-------------------------+----------------------+
                          |
                          v
+------------------------------------------------+
|             Repository / Query Layer           |
|                                                |
| Database Connection | Queries | Transactions   |
+-------------------------+----------------------+
                          |
                          v
+------------------------------------------------+
|                 SQLite Database                |
|                                                |
| Employees | Attendance | Users | Roles         |
| Organization | Audit Logs | Analytics          |
+------------------------------------------------+
```

### Architectural Principles

* Separation of concerns
* Reusable components
* Centralized API communication
* Secure authentication
* Backend authorization
* Database integrity
* Transactional operations
* Centralized error handling
* Structured logging
* Testability
* Maintainability

---

# Role-Based Access Control

The application uses RBAC to control access to functionality.

| Role             | Responsibility                                                |
| ---------------- | ------------------------------------------------------------- |
| **ADMIN**        | Full system administration and configuration                  |
| **HR MANAGER**   | Employee and workforce management                             |
| **TEAM MANAGER** | Team-level workforce and attendance management                |
| **TEAM LEAD**    | Team attendance and workforce monitoring                      |
| **EMPLOYEE**     | Personal profile, attendance and permitted workforce features |

Authorization must always be enforced on the backend and should not rely only on frontend route protection.

---

# Engineering Areas

The project covers the following engineering, development, testing, operations, and delivery areas.

| Area                        | What it should cover in your WFA project                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **1. Operation**            | Application startup, database initialization, health checks, environment configuration, scheduled jobs, operational procedures |
| **2. Architecture**         | React + TypeScript frontend, Express backend, REST APIs, SQLite persistence, RBAC, service/controller/repository separation    |
| **3. Planning**             | Feature breakdown, sprint planning, dependencies, risks, milestones, acceptance criteria                                       |
| **4. Estimation**           | Story points, development effort, testing effort, integration effort, deployment effort                                        |
| **5. Integration**          | Frontend ↔ REST API ↔ SQLite, authentication, attendance, workforce analytics, exports, notifications                          |
| **6. Database**             | SQLite schema, migrations, indexes, constraints, transactions, seed data, backup/restore, query optimization                   |
| **7. DevOps**               | Git branching, CI/CD, automated tests, linting, build validation, environment management, deployment pipelines                 |
| **8. Cloud**                | Production hosting, managed infrastructure where appropriate, secrets, storage, HTTPS, scaling and backups                     |
| **9. Debugging**            | API errors, authentication failures, SQLite issues, frontend rendering errors, network/proxy errors, production failures       |
| **10. Quality Assurance**   | Functional testing, regression testing, API testing, RBAC testing, validation, security checks                                 |
| **11. Performance Testing** | API response time, SQLite query performance, dashboard loading, large employee datasets, concurrent users                      |
| **12. Mobile Testing**      | Responsive dashboard, login/signup, tables, charts, sidebar, attendance flows, touch interactions                              |
| **13. Feedback**            | Developer/QA feedback, stakeholder feedback, UI feedback, defect feedback and action tracking                                  |
| **14. Documentation**       | Architecture, setup, database, API, authentication, deployment, troubleshooting and operational documentation                  |
| **15. Technical Writing**   | API specifications, technical decisions, implementation notes, ADRs, release notes, runbooks                                   |
| **16. Knowledge Sharing**   | Team walkthroughs, architecture sessions, coding standards, troubleshooting guides and feature demos                           |
| **17. Release Management**  | Versioning, release branches, changelog, release checklist, deployment approval, rollback strategy                             |
| **18. Monitoring**          | Application health, API latency, errors, database health, authentication failures and resource usage                           |
| **19. Alerting**            | API failures, high error rate, downtime, database problems, slow responses, failed deployments                                 |
| **20. Analytics**           | Workforce KPIs, attendance analytics, employee analytics, department/role analytics, trends, reports and dashboards            |

---

# Database

The project uses **SQLite as the primary persistence layer**.

MongoDB should not be required for the SQLite implementation.

## Database Responsibilities

* Schema management
* Database initialization
* Migrations
* Foreign-key relationships
* Unique constraints
* Data validation
* Indexing
* Transactions
* Seed data
* Test database
* Backup and restore
* Query optimization

## Main Data Areas

```text
Users
Organizations
Employees
Roles
Permissions
Attendance
Break Sessions
Attendance Events
Audit Logs
Analytics
```

## Database Principles

* Enable foreign-key enforcement.
* Use parameterized SQL queries.
* Avoid SQL injection vulnerabilities.
* Use transactions for multi-step operations.
* Add indexes to frequently queried columns.
* Maintain database constraints.
* Separate production and test databases.
* Keep database initialization reproducible.

---

# Backend Structure

A recommended backend organization is:

```text
backend/
├── database/
│   └── schema.sql
│
├── scripts/
│   ├── generate-test-data.js
│   ├── seed-sqlite.js
│   └── verify-sqlite.js
│
└── src/
    ├── app.js
    │
    ├── config/
    │   ├── db.js
    │   ├── env.js
    │   └── logger.js
    │
    ├── controllers/
    │   ├── analytics.controller.js
    │   ├── attendance.controller.js
    │   ├── audit.controller.js
    │   ├── auth.controller.js
    │   ├── employee.controller.js
    │   ├── organization.controller.js
    │   └── workforce.controller.js
    │
    ├── database/
    │   ├── connection.ts
    │   ├── query.ts
    │   └── sqlite.ts
    │
    ├── middleware/
    │   ├── auth.js
    │   ├── validation.js
    │   └── error-handler.js
    │
    ├── routes/
    │   └── api.routes.js
    │
    ├── services/
    │   ├── auth.service.js
    │   ├── attendance.service.js
    │   ├── analytics.service.js
    │   └── workforce.service.js
    │
    └── utils/
```

The exact structure can evolve as the project grows, but business logic should remain separated from route handling and database access.

---

# API Integration

The frontend communicates with the backend through REST APIs.

```text
Frontend
   |
   | GET / POST / PUT / PATCH / DELETE
   v
Express Routes
   |
   v
Authentication / Authorization
   |
   v
Controller
   |
   v
Service
   |
   v
Repository / SQL Query
   |
   v
SQLite
```

Important API areas include:

```text
/v1/auth
/v1/employees
/v1/attendance
/v1/workforce
/v1/analytics
/v1/organizations
/v1/audit
```

API responses should use consistent:

* HTTP status codes
* Response structures
* Error structures
* Validation messages
* Authentication handling
* Logging

---

# Authentication and Security

Security is a core requirement of the application.

## Security Requirements

* Password hashing
* Secure authentication
* Authorization middleware
* RBAC enforcement
* Input validation
* SQL injection prevention
* Secure environment variables
* HTTP security headers
* CORS configuration
* Rate limiting where required
* Secure error responses
* Audit logging
* No secrets committed to Git

Sensitive configuration must be stored through environment variables and must not be hard-coded in source code.

---

# Testing and Quality Assurance

The project should maintain multiple levels of testing.

## Unit Testing

Test:

* Services
* Utility functions
* Validation
* Authentication logic
* Permission logic
* Database helpers

## Integration Testing

Test:

* API + database
* Authentication flows
* Attendance flows
* Employee workflows
* RBAC
* Analytics endpoints

## Regression Testing

Verify that existing functionality continues to work after every significant change.

## Negative Testing

Test cases should include:

* Invalid credentials
* Missing required fields
* Unauthorized access
* Invalid employee IDs
* Duplicate records
* Invalid attendance transitions
* Check-out before check-in
* Invalid roles
* Invalid organization access
* Database failures
* API failures

---

# Performance

Performance testing should cover:

* API response time
* Database query execution
* Dashboard loading
* Chart rendering
* Large employee datasets
* Pagination
* Filtering
* Search
* Concurrent requests
* Memory consumption

Performance goals should be measurable rather than based only on visual perception.

---

# Mobile Testing

The application should be responsive across:

* Desktop
* Laptop
* Tablet
* Mobile

Mobile testing should cover:

* Login
* Signup
* Dashboard
* Sidebar
* Navigation
* Employee tables
* Charts
* Filters
* Attendance
* Check-in
* Break
* Resume
* Check-out
* Forms
* Buttons
* Touch interactions

The UI must remain usable without horizontal overflow or broken layouts.

---

# DevOps and CI/CD

The project should use a controlled Git workflow.

```text
main
 |
 +-- feature/*
 |
 +-- bugfix/*
 |
 +-- release/*
```

CI/CD should validate:

```text
Install dependencies
        ↓
Lint
        ↓
Type checking
        ↓
Unit tests
        ↓
Integration tests
        ↓
Production build
        ↓
Deployment validation
```

Pull requests should be reviewed before merging into the production branch.

---

# Cloud and Deployment

For production deployment, the system should provide:

* Frontend hosting
* Backend hosting
* HTTPS
* Environment variables
* Secrets management
* Database persistence
* Database backups
* Logging
* Monitoring
* Deployment rollback

Because SQLite is file-based, production deployment must ensure that the SQLite database is stored on **persistent storage** and is not lost when an application instance is recreated.

For higher-concurrency production requirements, database architecture should be reviewed before scaling to multiple application instances.

---

# Debugging

Debugging should follow a structured process.

```text
Problem
   ↓
Reproduce
   ↓
Check Browser Console
   ↓
Check Network Request
   ↓
Check Backend Logs
   ↓
Check API Controller
   ↓
Check Service
   ↓
Check SQL Query
   ↓
Check SQLite Database
   ↓
Fix
   ↓
Add Regression Test
   ↓
Verify
```

Common issues to investigate include:

* Vite proxy errors
* API connection failures
* Authentication failures
* Invalid tokens
* SQLite connection failures
* SQL errors
* React rendering errors
* TypeScript errors
* Environment configuration errors
* Production deployment failures

---

# Monitoring and Alerting

## Monitoring

Monitor:

* Application health
* API latency
* API error rate
* Database health
* Authentication failures
* Resource utilization
* Failed requests
* Deployment status

## Health Checks

Recommended endpoints:

```text
GET /health
GET /ready
```

## Alerting

Alerts should be configured for:

* Application downtime
* High API error rate
* Database failures
* Slow API responses
* Failed deployments
* Authentication anomalies
* Resource exhaustion

---

# Analytics

The Workforce Analytics dashboard should provide actionable workforce information.

## Workforce KPIs

Examples include:

* Total employees
* Active employees
* Attendance rate
* Absence rate
* Average working hours
* Workforce growth
* Department distribution
* Role distribution

## Analytics Areas

```text
Workforce Analytics
├── Employee Analytics
├── Attendance Analytics
├── Department Analytics
├── Role Analytics
├── Location Analytics
├── Salary Analytics
├── Performance Analytics
├── Employee Growth
└── Workforce Trends
```

Analytics should be backed by actual database/API data rather than hard-coded mock values in production.

---

# Documentation and Knowledge Sharing

Documentation should cover:

* Project setup
* Architecture
* Database
* API endpoints
* Authentication
* RBAC
* Attendance
* Analytics
* Testing
* Deployment
* Troubleshooting
* Monitoring
* Release procedures

## Knowledge Sharing

The team should conduct:

* Architecture walkthroughs
* Feature demonstrations
* Code reviews
* Testing walkthroughs
* Troubleshooting sessions
* Database design discussions
* Deployment walkthroughs

---

# Technical Writing

Technical documentation should include:

* API specifications
* Architecture decisions
* Implementation notes
* Architecture Decision Records
* Database documentation
* Runbooks
* Release notes
* Troubleshooting guides

Technical documentation should remain synchronized with the implementation.

---

# Feedback

Feedback should be collected from:

* Developers
* QA engineers
* Team leads
* Product stakeholders
* End users

Feedback should be tracked using:

```text
Feedback
   ↓
Categorize
   ↓
Prioritize
   ↓
Assign
   ↓
Implement
   ↓
Test
   ↓
Verify
   ↓
Close
```

---

# Release Management

Each release should follow a controlled process.

```text
Feature Complete
      ↓
Code Review
      ↓
QA Validation
      ↓
Regression Testing
      ↓
Performance Validation
      ↓
Release Candidate
      ↓
Deployment
      ↓
Smoke Testing
      ↓
Production Monitoring
```

Release management should include:

* Semantic versioning
* Release branches where required
* Changelog
* Release checklist
* Deployment approval
* Smoke testing
* Rollback strategy
* Post-release monitoring

---

# Planning and Estimation

Each feature should be planned before implementation.

## Planning

Define:

* Requirements
* User stories
* Acceptance criteria
* Dependencies
* Risks
* Technical approach
* Testing requirements

## Estimation

Estimate:

* Frontend development
* Backend development
* Database work
* Integration
* Testing
* Bug fixing
* Documentation
* Deployment

Example:

| Work Item          |      Estimate |
| ------------------ | ------------: |
| UI development     |      3 points |
| API development    |      3 points |
| SQLite integration |      2 points |
| Testing            |      2 points |
| Documentation      |       1 point |
| **Total**          | **11 points** |

Estimates should be updated when requirements or technical complexity change.

---

# Development Workflow

Recommended workflow:

```text
1. Understand requirement
        ↓
2. Create task
        ↓
3. Plan implementation
        ↓
4. Create feature branch
        ↓
5. Implement
        ↓
6. Unit test
        ↓
7. Integration test
        ↓
8. Code review
        ↓
9. QA validation
        ↓
10. Merge
        ↓
11. Deploy
        ↓
12. Monitor
```

Example branch:

```bash
git switch -c feature/attendance-improvements
```

Example commit:

```bash
git add .
git commit -m "feat: improve attendance workflow"
```

---

# Environment Configuration

Create environment configuration based on the provided environment template.

Typical configuration includes:

```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./database/wfa.sqlite
API_BASE_URL=http://localhost:5000
```

Do not commit real secrets or production credentials.

---

# Getting Started

## Prerequisites

Install:

* Node.js
* npm
* Git

## Clone the repository

```bash
git clone https://github.com/maheswari-pinneti/WFA-SQLITE-Frontend-project.git
cd WFA-SQLITE-Frontend-project
```

## Backend

```bash
cd backend
npm install
```

Initialize or seed the SQLite database using the project's database scripts.

## Start Backend

```bash
npm start
```

## Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

The exact commands should follow the scripts defined in the project's `package.json` files.

---

# Troubleshooting

## Backend API is not reachable

Check:

```text
1. Backend process is running
2. PORT is correct
3. Frontend API URL is correct
4. Vite proxy configuration
5. CORS configuration
6. Backend logs
```

## SQLite errors

Check:

```text
1. Database file exists
2. Database path is correct
3. Schema has been initialized
4. Foreign keys are valid
5. SQL query is valid
6. Database file permissions
```

## Login problems

Check:

```text
1. Backend authentication endpoint
2. User exists in SQLite
3. Password validation
4. Authentication middleware
5. Token/session handling
6. Frontend API request
```

---

# Future Improvements

Potential future enhancements include:

* Advanced workforce forecasting
* Advanced attendance analytics
* Real-time workforce updates
* Improved audit reporting
* Notification system
* Advanced RBAC permissions
* Automated database backups
* Automated deployment
* Enhanced monitoring
* Performance dashboards
* Advanced mobile optimization
* Accessibility improvements
* Automated security scanning

---

# Project Quality Goals

The project aims to maintain:

* Clean architecture
* Secure authentication
* Reliable SQLite persistence
* Strong RBAC
* High test coverage
* Responsive UI
* Good API performance
* Production-ready deployment
* Effective monitoring
* Clear documentation
* Maintainable code
* Reliable release management

---

# License

This project is licensed under the MIT License.

---

## Developed By

<div align="center">

### Developed by **Maheswari Pinneti**

**Frontend Developer at Stackly**

<br />

<img src="./public/stackly-logo.png" alt="Stackly Logo" width="180" />

<br />
<br />

**Workforce Analytics Platform**

Built with React, TypeScript, Express.js, SQLite, REST APIs, RBAC, and modern workforce analytics technologies.

</div>

---

### About the Developer

**Maheswari Pinneti**  
Frontend Developer  
**Stackly**

Responsible for frontend development, UI implementation, API integration, responsive design, dashboard development, workforce analytics interfaces, testing, debugging, and continuous improvement of the Workforce Analytics Platform.

---

<div align="center">

**© 2026 Maheswari Pinneti | Stackly**

</div>
