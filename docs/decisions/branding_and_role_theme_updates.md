# Branding, Theme, and Directory Layout Updates

This document summarizes the recent system-wide updates implemented to customize workspace branding, visual themes per role, directory tables, and layouts.

## 🎨 1. Role-Based Custom Themes
We configured five recommended role themes by overriding custom CSS variables inside `index.css` and dynamically loading them on the `MainLayout` container:
- **HR Manager** $\rightarrow$ **Earthy Aurora** (`.earth-theme`) (Soft Creams, Sand Cards, Moss Green accents; defaults to Light Mode)
- **Employee** $\rightarrow$ **Arctic Minimalist** (`.arctic-theme`) (Cool Blue accents, breathable layout; defaults to Light Mode)
- **Team Lead** $\rightarrow$ **Midnight Slate** (`.midnight-theme`) (Modern slate-dark, teal accents; defaults to Dark Mode)
- **Team Manager** $\rightarrow$ **Corporate Indigo** (`.indigo-theme`) (Indigo borders, structured; defaults to Light Mode)
- **Admin / Super Admin** $\rightarrow$ **Cyber Sunset** (`.sunset-theme`) (Vibrant alert-orange accents, dark grid; defaults to Dark Mode)

## 🏢 2. Employee Directory Roster
- **Capacity**: Seeding increased from 200 to **250 records** inside the SQLite backend database, plus custom employees (Uday, Suresh, Ravi, Suman).
- **Format**: Dynamic employee STK ID generator matches `STK-[Joining Year]-[Initials][SequenceNumber]` (e.g. `STK-2023-UD0001`).
- **Table Headings**: Configured the complete 12 table headings:
  1. Employee ID
  2. Employee Name
  3. Department
  4. Designation
  5. Employment Status
  6. Email
  7. Phone
  8. Location
  9. Joining Date
  10. Manager
  11. Attendance Status
  12. Actions (`👁` and `⋮`)

## 📐 3. Header & Sidebar Spacing Gaps
- Aligned the `.app-sidebar` sticky top position (`top: 4rem !important`) and height (`calc(100vh - 4rem) !important`) exactly with the header layout to close the vertical spacing gap.
- Offset the sidebar using `margin-top: -1px !important` to overlay borders and eliminate subpixel rendering lines.

## 🏷️ 4. Brand Logo Replacement
- Overwrote `public/assets/images/logo.png` with the new stylized STACKLY brand assets.
