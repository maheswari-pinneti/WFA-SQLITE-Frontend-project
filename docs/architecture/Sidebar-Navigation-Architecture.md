# STACKLY - Workforce Analytics Dashboard
## Enterprise Sidebar Navigation Architecture & Specifications

**Author:** Senior Frontend Architect & UI/UX Engineer  
**Stack:** React 19, TypeScript, Material UI, Redux Toolkit, React Router DOM  
**Access Control:** Role-Based Access Control (RBAC) + Permission-Based Navigation  
**Design Theme:** Dark Enterprise (`#0B1120`), Glassmorphism (`backdrop-blur-md`), Modern SaaS Dashboard  

---

## 1. Sidebar Navigation Flow & RBAC Architecture Diagram

```mermaid
flowchart TD
    subgraph AUTH["Authentication & Session"]
        USER["Active User Session"]
        ROLE["Role: ADMIN | HR_MANAGER | DEPT_HEAD | TEAM_LEAD | EMPLOYEE"]
    end

    subgraph CONFIG["sidebarConfig Registry"]
        I1["1. Dashboard (/dashboard)"]
        I2["2. Analytics (/analytics)"]
        I3["3. Employee Management (/employees)"]
        I4["4. Employee Directory (/employee-directory)"]
        I5["5. Departments (/departments)"]
        I6["6. Location Management (/locations)"]
        I7["7. Audit Logs (/audit-logs)"]
        I8["8. Reports (/reports)"]
        I9["9. Configuration (/configuration)"]
        I10["10. System Settings (/settings)"]
        I11["11. Help & Q/A (/help)"]
    end

    subgraph FILTER["RBAC Access Evaluator (accessControl.ts)"]
        EVAL{"Check User Role & Permissions"}
    end

    subgraph VIEW["Rendered Sidebar Navigation (280px / 80px)"]
        HEADER["STACKLY Brand Logo & Title"]
        PROFILE["User Profile Card (Name, Role, Dept, Active Dot)"]
        MENU["Filtered Dynamic Navigation Items"]
        FOOTER["Profile, Settings & Logout Footer"]
    end

    USER --> ROLE
    ROLE --> EVAL
    CONFIG --> EVAL
    EVAL -->|Role Authorized| MENU
    HEADER --> VIEW
    PROFILE --> VIEW
    MENU --> VIEW
    FOOTER --> VIEW
```

---

## 2. Component Structure Architecture

```text
src/
├── config/
│   └── sidebarConfig.ts         # Central 11 Navigation Menu Registry & Submenu Items
├── rbac/
│   ├── roles.ts                 # Role Enum (ADMIN, HR_MANAGER, DEPARTMENT_HEAD, TEAM_LEAD, EMPLOYEE)
│   ├── permissions.ts           # Permission Enum (USER_CREATE, EMPLOYEE_VIEW, ATTENDANCE_APPROVE, etc.)
│   └── accessControl.ts         # Access control evaluation service
└── layouts/
    ├── Sidebar.tsx              # Main Container Sidebar Layout (280px / 80px)
    ├── SidebarItem.tsx          # NavLink & Animated Submenu Accordion Component
    ├── SidebarGroup.tsx         # Category Group Wrapper
    └── UserProfile.tsx          # User Profile Card (Name, Role, Dept, Online Dot)
```

---

## 3. Navigation Items & RBAC Access Matrix

| # | Navigation Menu Item | Route Path | Submenu Items | Allowed Roles |
|---|---|---|---|---|
| **1** | **Dashboard** | `/dashboard` | Overview, KPIs, Attendance, Performance | `ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`, `TEAM_LEAD`, `EMPLOYEE` |
| **2** | **Analytics** | `/analytics` | Workforce, Attendance, Performance, Productivity, Salary, Diversity | `ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD` |
| **3** | **Employee Management** | `/employees` | Directory, Profile, Add Employee, Update, Lifecycle, Status | `ADMIN`, `HR_MANAGER` |
| **4** | **Employee Directory** | `/employee-directory` | Search, Filters, Department Listing, Role Listing | `ADMIN`, `HR_MANAGER`, `TEAM_LEAD`, `EMPLOYEE` |
| **5** | **Departments** | `/departments` | Overview, Department Analytics, Members, Performance | `ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD` |
| **6** | **Location Management** | `/locations` | Office Locations, Distribution, Branch Management | `ADMIN`, `HR_MANAGER` |
| **7** | **Audit Logs** | `/audit-logs` | Login History, Activity Tracking, Permission Changes | `ADMIN` (Only) |
| **8** | **Reports** | `/reports` | Workforce, Attendance, Performance, Custom, Export | `ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD` |
| **9** | **Configuration** | `/configuration` | Roles, Permissions, RBAC/DBAC Rules, Notifications | `ADMIN` (Only) |
| **10** | **System Settings** | `/settings` | Application, Security, Theme, Integration, Account | `ADMIN` |
| **11** | **Help & Q/A** | `/help` | Knowledge Base, User Guide, FAQ, Support Ticket | All Users |

---

## 4. UI Design System Tokens
- **Background**: Dark Navy (`#0B1120`)
- **Expanded Width**: `280px`
- **Collapsed Width**: `80px`
- **Active Menu Highlight**: `bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25`
- **Online Indicator**: Green pulsing dot (`bg-emerald-400 animate-pulse`) with `● Active` text status badge.
- **Glassmorphism**: `backdrop-blur-md` with `border-slate-800/80`.

---

## 📐 Sidebar Layout & Footer Alignment Guide

To ensure the sidebar extends perfectly down to the footer (without overlapping it or leaving gaps), we utilize the following targeted layout structures depending on dashboard behavior:

### Method 1: The "Sticky" Sidebar (Best if the main page scrolls)

If the main content is long and the sidebar should follow the user as they scroll, but stop right before the footer:

```css
.main-wrapper {
  display: flex;
  align-items: flex-start; /* Important for sticky to work */
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 60px; /* Adjust this to match your exact Navbar height */
  /* Calculates height: 100% of viewport minus Navbar height */
  height: calc(100vh - 60px); 
  overflow-y: auto; /* Adds a scrollbar to the sidebar if its menu gets too long */
}
```

### Method 2: The "Flex Stretch" (Best for fixed-screen dashboards)

If the entire dashboard is designed to fit exactly within the screen height (like a desktop web app) and the main content has its own internal scrollbar:

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Locks the app to the screen height */
  overflow: hidden; 
}

.navbar {
  flex-shrink: 0;
}

.main-wrapper {
  display: flex;
  flex: 1; /* Pushes the footer down and takes up available space */
  overflow: hidden;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%; /* Stretches exactly from navbar to footer */
  overflow-y: auto;
}

.main-content {
  flex: 1;
  overflow-y: auto; /* Main content scrolls independently */
}

.footer {
  flex-shrink: 0;
}
```

### 💡 Quick Troubleshooting Checklist

If the sidebar is not touching the footer perfectly:

1. **Hidden Margins:** Inspect `.sidebar`, `.main-wrapper`, or the first child inside `.sidebar` in your browser's DevTools. Make sure there is no `margin-bottom` on the sidebar or `margin-top` on the footer.
2. **Padding on the Wrapper:** Ensure the container holding the sidebar doesn't have padding at the bottom (e.g., `padding-bottom: 20px;`).
3. **Absolute Positioning:** If your sidebar is currently using `position: fixed` or `position: absolute`, change it to `flex` or `sticky`. Fixed position takes it out of the document flow, making it very difficult to stop exactly at the footer.

