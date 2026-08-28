# Workforce Analytics Dashboard - Header Architecture

This document presents the enterprise responsive header navigation architecture, Redux state model, RBAC header behaviors, API integration flows, and component breakdown for the **Workforce Analytics Dashboard**.

---

## 1. Header UI Architecture Diagram

```mermaid
---
title: "Workforce Analytics Dashboard - Header UI Architecture"
---
flowchart TD
    subgraph HEADER_CONTAINER["Header Container (Sticky Glassmorphism Top Bar)"]
        subgraph LEFT["LEFT SECTION (HeaderLeft)"]
            TOGGLE["SidebarToggle (Hamburger Menu)"]
            TITLE["PageTitle (Dynamic Route Header)"]
            CRUMBS["Breadcrumbs (Home > Section > Page)"]
            TOGGLE --> TITLE --> CRUMBS
        end

        subgraph CENTER["CENTER SECTION (HeaderCenter)"]
            SEARCH["GlobalSearch (Employees, Depts, Reports, Shortcuts Ctrl+K)"]
        end

        subgraph RIGHT["RIGHT SECTION (HeaderRight)"]
            NOTIF["NotificationMenu (Real-time Alerts & Badges)"]
            THEME["ThemeToggle (Light / Dark Mode)"]
            LANG["LanguageSelector (EN, HI, ES, FR, DE)"]
            PROFILE["UserProfileMenu (Avatar, Name, Role, Logout)"]
            NOTIF --> THEME --> LANG --> PROFILE
        end
    end

    subgraph STATE["Redux Toolkit Header State"]
        H_SLICE["headerSlice (sidebarOpen, theme, notifications, searchQuery, userProfile)"]
    end

    HEADER_CONTAINER <--> STATE
```

---

## 2. React Component Architecture

```text
src/components/header/
├── Header.tsx               # Master Modular Header Layout Container
├── HeaderLeft.tsx           # Groups Toggle, PageTitle & Breadcrumbs
│   ├── SidebarToggle.tsx    # Mobile & Desktop Sidebar Collapse Button
│   ├── Breadcrumbs.tsx      # Dynamic Route Breadcrumbs (Clickable)
│   └── PageTitle.tsx        # Dynamic Role & Page Title Component
├── HeaderCenter.tsx         # Center Section Wrapper
│   └── GlobalSearch.tsx     # Ctrl + K Search Bar with Filter Pills & Recent Results
├── HeaderRight.tsx          # Groups Right Action Controls
│   ├── NotificationMenu.tsx # Real-time Notification Bell & Unread Badges
│   ├── ThemeToggle.tsx      # Light / Dark Theme Switcher Button
│   ├── LanguageSelector.tsx # Multi-Language Scope Switcher Dropdown
│   └── UserProfileMenu.tsx  # User Avatar, Details, Account Settings & Logout
├── HeaderActions.tsx        # Actions Group Component
├── HeaderResponsive.tsx     # Tablet / Mobile Responsive Controls
├── types.ts                 # TypeScript Interfaces & Header State Data Model
├── headerSlice.ts           # Redux Toolkit Header State Slice
└── index.ts                 # Central Module Barrel Export
```

---

## 3. Redux State Structure (`headerSlice.ts`)

```typescript
export interface HeaderState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: LanguageOption;
  notifications: HeaderNotification[];
  unreadNotificationCount: number;
  searchQuery: string;
  searchCategory: 'all' | 'employees' | 'departments' | 'reports' | 'security';
  searchFocused: boolean;
  activeDropdown: 'notif' | 'profile' | 'role' | 'language' | null;
}
```

---

## 4. API Integration Flow

```mermaid
sequenceDiagram
title Header API & Authentication Integration Data Flow
actor User
participant Client as "React Frontend (Header)"
participant Redux as "Redux Toolkit Store"
participant AuthAPI as "Authentication Service"
participant NotifAPI as "Notification API (GET /notifications)"
User ->> Client: Login Request
Client ->> AuthAPI: POST /auth/login
AuthAPI -->> Client: Return User Token & Role Metadata
Client ->> Redux: Dispatch setUser(Name, Role, Department, Permissions)
Redux -->> Client: Update Header Profile Avatar & Role Badge
Client ->> NotifAPI: GET /notifications
NotifAPI -->> Client: Return Real-time Alerts & Unread Badges
Client ->> Redux: Update Header Notifications Array
```

---

## 5. RBAC & Permission-Based Header Behavior

- **ADMIN HEADER**: Displays organization statistics, system audit stream, security alert badges, and system settings access.
- **HR MANAGER HEADER**: Displays HR recruitment alerts, candidate applications, leave request queues, and employee lifecycle updates.
- **DEPARTMENT MANAGER HEADER**: Displays department headcount trends, team leave approvals, and performance evaluation reminders.
- **TEAM LEAD HEADER**: Displays active sprint task counts, team attendance alerts, and productivity metrics.
- **EMPLOYEE HEADER**: Displays personal notifications, leave balance status, and performance goals updates.

---

## 6. Complete Layout Integration

```text
-----------------------------------------------------------------------------
| Logo | Breadcrumbs | Global Search (Ctrl + K) | Notifications | Theme | User |
-----------------------------------------------------------------------------
|          |                                                                |
| Sidebar  |                   Dashboard Content Area                       |
| Navigation|                                                               |
-----------------------------------------------------------------------------
```
