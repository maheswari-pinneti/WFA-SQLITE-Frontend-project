# Stackly Workforce Intelligence
## Enterprise Brand Identity & Design System Specification

**Product Name:** Stackly Workforce Intelligence  
**Short Name:** Stackly WFA  
**Website Title:** `Stackly Workforce Intelligence | Enterprise HR & Analytics Platform`  
**Tagline:** *"Transforming Workforce Data into Intelligent Business Decisions"*  
**Target Domain:** `thestackly.com`  

---

## 1. Product Naming & Position Architecture

### Brand Identity Matrix
- **Full Enterprise Name:** Stackly Workforce Intelligence
- **Short Name:** Stackly WFA
- **SaaS Domain:** `https://thestackly.com`
- **Application Title Tag:** `Stackly Workforce Intelligence | Enterprise HR & Analytics Platform`
- **Primary Value Proposition:** "AI-powered workforce intelligence platform providing real-time employee analytics, attendance insights, productivity metrics, and enterprise governance."

---

## 2. Logo Concept & Graphic Design Specification

### Dual-Ribbon Infinity Flame Logo (SVG & Vector Graphic)
The **Stackly** logo combines two intersecting fluid ribbons representing data synthesis, continuous workflow, and human intelligence:
1. **Upper Ribbon (Mint Teal `#34D399`):** Symbolizes growth, human capital vitality, agility, and positive productivity metrics.
2. **Lower Ribbon (Deep Navy / Royal Blue `#2563EB` to `#0F172A`):** Symbolizes enterprise stability, security governance, data precision, and analytical depth.

```svg
<!-- Official STACKLY Dual Ribbon Flame Icon -->
<svg width="42" height="52" viewBox="0 0 100 125" fill="none">
  <path d="M65 8C40 8 12 35 12 65C12 78 18 90 28 98C22 84 25 65 38 52C50 40 68 35 78 22C74 12 68 8 65 8Z" fill="url(#mint_teal_grad)"/>
  <path d="M35 117C60 117 88 90 88 60C88 47 82 35 72 27C78 41 75 60 62 73C50 85 32 90 22 103C26 113 32 117 35 117Z" fill="url(#deep_navy_grad)"/>
  <defs>
    <linearGradient id="mint_teal_grad" x1="12" y1="8" x2="78" y2="98" gradientUnits="userSpaceOnUse">
      <stop stopColor="#6EE7B7" />
      <stop offset="0.6" stopColor="#34D399" />
      <stop offset="1" stopColor="#10B981" />
    </linearGradient>
    <linearGradient id="deep_navy_grad" x1="22" y1="27" x2="88" y2="117" gradientUnits="userSpaceOnUse">
      <stop stopColor="#2563EB" />
      <stop offset="0.5" stopColor="#1E3A8A" />
      <stop offset="1" stopColor="#0F172A" />
    </linearGradient>
  </defs>
</svg>
```

---

## 3. Corporate Color Palette & Tokens

### Primary Theme Palette
- **Obsidian Dark Background:** `#0B1120` (Sidebar & Dark Theme Root)
- **Deep Slate Container:** `#0F172A` / `#1E293B` (Panel Cards & Headers)
- **Primary Brand Blue:** `#2563EB` (Interactive Buttons, Active Nav)
- **Royal Indigo Accent:** `#4F46E5` (Gradients & KPI Badges)
- **Mint Teal Growth:** `#34D399` (Secondary Logos, Active Badges)
- **Emerald Green:** `#10B981` (Positive Trends & Attendance Checks)
- **Amber Warning:** `#F59E0B` (Pending Approvals & Notifications)
- **Rose Alert:** `#EF4444` (Turnover Alerts & Logout Actions)

### UI Glassmorphism System
- **Panel Backdrop:** `backdrop-blur-md bg-slate-900/90 border border-slate-800/80 shadow-2xl`
- **Active Navigation Highlight:** `bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25`

---

## 4. Typography & Iconography Standards

- **Primary Body Font:** Inter / Outfit Sans-Serif
- **Monospace Font:** JetBrains Mono (For IDs, timestamps, code snippets, numbers)
- **Icon Library:** Lucide React & Material UI Icons
- **Icon Style:** Modern minimalist line-icons with explicit stroke widths (`strokeWidth={2}`).

---

## 5. Main Application Branding & Role Persona Specs

### 1. Authentication Branding
- **Headline:** *"Smart workforce decisions powered by real-time analytics"*
- **Domain Gate:** Strictly enforces `@thestackly.com` official email domains.
- **MFA Security:** Integrated 60-second OTP verification timer and SSL 256-bit encryption badge.

### 2. Role-Based Branding Perspectives
- **ADMIN (System Administrator):** Full system governance, audit stream monitoring, RBAC permission assignment.
- **HR MANAGER (Human Resources):** Employee lifecycle, recruitment requisitions, attendance roster, HR reports.
- **TEAM MANAGER (Department Head):** Department-wide performance, headcount allocation, salary tier distribution.
- **TEAM LEAD (Team Lead):** Daily productivity tracking, attendance approvals, task allocation.
- **EMPLOYEE (Employee Workspace):** Individual performance scorecard, leave submission, payslip history.

---

## 6. Landing Page & Dashboard Welcome Messaging

- **Hero Landing Headline:** *"Unify People, Data, and Performance with Stackly Workforce Intelligence"*
- **Executive Dashboard Greeting:** *"Good Morning, [Name] 👋 — Smart workforce decisions powered by real-time analytics"*
- **Real-Time Status Line:** `● Online • 99.98% System Health • Data Scope: @thestackly.com`
