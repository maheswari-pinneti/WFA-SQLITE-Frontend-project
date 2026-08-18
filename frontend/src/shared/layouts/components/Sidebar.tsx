import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS, Role } from '../../../security/roles/roles';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  TrendingUp,
  BarChart3,
  Sliders,
  Zap,
  User,
  FileText,
  Layers,
  FileSpreadsheet,
  History,
  Briefcase,
  ClipboardList,
  UserCog,
  Network,
  Globe,
  Calendar,
  Timer,
  CheckSquare,
  ShieldAlert,
  Compass,
  Target,
  Map,
  Activity,
  Key,
  ShieldCheck,
  MapPin,
  HelpCircle,
  Award,
  AlertTriangle,
  Star,
  PanelLeftClose,
  LockKeyhole,
  Moon,
  Sun,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  };
}

export interface NavigationCategory {
  category: string;
  items: NavigationItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSupport: () => void;
}

const ROLE_ACCENTS: Record<Role, { className: string; shortLabel: string }> = {
  [Role.ADMIN]: { className: 'sidebar-accent-emerald', shortLabel: 'Admin workspace' },
  [Role.HR]: { className: 'sidebar-accent-emerald', shortLabel: 'People operations' },
  [Role.MANAGER]: { className: 'sidebar-accent-emerald', shortLabel: 'Department workspace' },
  [Role.TEAM_LEAD]: { className: 'sidebar-accent-emerald', shortLabel: 'Team workspace' },
  [Role.EMPLOYEE]: { className: 'sidebar-accent-emerald', shortLabel: 'Employee workspace' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenSupport,
}) => {
  const { role } = useAuth();
  const location = useLocation();
  const [navigationQuery, setNavigationQuery] = useState('');

  // Clean Navigation Structure
  const roleCategorizedNavMap: Record<Role, NavigationCategory[]> = {
    [Role.ADMIN]: [
      {
        category: 'Dashboard',
        items: [
          { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'Analytics',
        items: [
          { label: 'Workforce Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} strokeWidth={2} className="text-indigo-400" /> },
          { label: 'Attendance Analytics', path: '/hr/attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Hiring Analytics', path: '/hr/recruitment', icon: <Briefcase size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Performance Analytics', path: '/hr/performance', icon: <TrendingUp size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Productivity Analytics', path: '/admin/productivity', icon: <Zap size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Skills Analytics', path: '/admin/skills-gaps', icon: <Award size={18} strokeWidth={2} className="text-yellow-400" /> },
          { label: 'Risk Analytics', path: '/admin/risk', icon: <AlertTriangle size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Workforce',
        items: [
          { label: 'Employees', path: '/admin/employees', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Departments', path: '/admin/departments', icon: <Building2 size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Teams', path: '/admin/teams', icon: <Network size={18} strokeWidth={2} className="text-teal-400" /> },
          { label: 'Organization', path: '/admin/organization', icon: <Globe size={18} strokeWidth={2} className="text-sky-400" /> },
        ],
      },
      {
        category: 'Attendance',
        items: [
          { label: 'Overview', path: '/admin/attendance-overview', icon: <Calendar size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Attendance History', path: '/admin/attendance-history', icon: <History size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Shifts', path: '/admin/shifts', icon: <Timer size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Corrections', path: '/admin/corrections', icon: <CheckSquare size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Approvals', path: '/admin/approvals', icon: <ShieldAlert size={18} strokeWidth={2} className="text-red-400" /> },
        ],
      },
      {
        category: 'Skills',
        items: [
          { label: 'Skill Overview', path: '/admin/skills-overview', icon: <Compass size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Skill Gaps', path: '/admin/skills-gaps', icon: <Target size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Skill Coverage', path: '/admin/skills-coverage', icon: <Map size={18} strokeWidth={2} className="text-indigo-400" /> },
        ],
      },
      {
        category: 'Performance',
        items: [
          { label: 'Performance Overview', path: '/admin/performance-overview', icon: <Star size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Productivity', path: '/admin/productivity-metrics', icon: <Activity size={18} strokeWidth={2} className="text-emerald-400" /> },
        ],
      },
      {
        category: 'Administration',
        items: [
          { label: 'Users & Roles', path: '/admin/users', icon: <UserCog size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Permissions', path: '/admin/permissions', icon: <Key size={18} strokeWidth={2} className="text-yellow-400" /> },
          { label: 'Access Control', path: '/admin/access-control', icon: <ShieldCheck size={18} strokeWidth={2} className="text-green-400" /> },
          { label: 'Geofencing', path: '/admin/geofencing', icon: <MapPin size={18} strokeWidth={2} className="text-orange-400" /> },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Settings',
        items: [
          { label: 'Settings', path: '/admin/settings', icon: <Sliders size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Help & Support',
        items: [
          { label: 'Help & Support', path: '#support', icon: <HelpCircle size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
    ],

    [Role.HR]: [
      {
        category: 'Dashboard',
        items: [
          { label: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'Analytics',
        items: [
          { label: 'Workforce Analytics', path: '/hr/workforce-analytics', icon: <BarChart3 size={18} strokeWidth={2} className="text-indigo-400" /> },
          { label: 'Attendance Analytics', path: '/hr/attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Hiring Analytics', path: '/hr/recruitment', icon: <Briefcase size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Performance Analytics', path: '/hr/performance', icon: <TrendingUp size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Productivity Analytics', path: '/hr/productivity', icon: <Zap size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Skills Analytics', path: '/hr/skills-gaps', icon: <Award size={18} strokeWidth={2} className="text-yellow-400" /> },
          { label: 'Risk Analytics', path: '/hr/risk', icon: <AlertTriangle size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Workforce',
        items: [
          { label: 'Employees', path: '/hr/employees', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Departments', path: '/hr/departments', icon: <Building2 size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Teams', path: '/hr/teams', icon: <Network size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Attendance',
        items: [
          { label: 'Overview', path: '/hr/attendance-overview', icon: <Calendar size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Attendance History', path: '/hr/attendance-history', icon: <History size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Shifts', path: '/hr/shifts', icon: <Timer size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Corrections', path: '/hr/corrections', icon: <CheckSquare size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Approvals', path: '/hr/approvals', icon: <ShieldAlert size={18} strokeWidth={2} className="text-red-400" /> },
        ],
      },
      {
        category: 'Skills',
        items: [
          { label: 'Skill Overview', path: '/hr/skills-overview', icon: <Compass size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Skill Gaps', path: '/hr/skills-gaps', icon: <Target size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Skill Coverage', path: '/hr/skills-coverage', icon: <Map size={18} strokeWidth={2} className="text-indigo-400" /> },
        ],
      },
      {
        category: 'Performance',
        items: [
          { label: 'Performance Overview', path: '/hr/performance-overview', icon: <Star size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Productivity', path: '/hr/productivity-metrics', icon: <Activity size={18} strokeWidth={2} className="text-emerald-400" /> },
        ],
      },
      {
        category: 'Recruitment',
        items: [
          { label: 'Hiring Analytics', path: '/hr/recruitment-analytics', icon: <Briefcase size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Workforce Planning', path: '/hr/workforce-planning', icon: <Layers size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Reports',
        items: [
          { label: 'Reports', path: '/hr/reports', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Audit Logs', path: '/hr/audit-logs', icon: <History size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Settings',
        items: [
          { label: 'Settings', path: '/hr/settings', icon: <Sliders size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Help & Support',
        items: [
          { label: 'Help & Support', path: '#support', icon: <HelpCircle size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
    ],

    [Role.MANAGER]: [
      {
        category: 'Dashboard',
        items: [
          { label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'Team Analytics',
        items: [
          { label: 'Workforce', path: '/manager/analytics', icon: <BarChart3 size={18} strokeWidth={2} className="text-indigo-400" /> },
          { label: 'Attendance', path: '/manager/attendance-analytics', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Productivity', path: '/manager/productivity', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Performance', path: '/manager/performance', icon: <TrendingUp size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Skill Gaps', path: '/manager/skills-gaps', icon: <Award size={18} strokeWidth={2} className="text-yellow-400" /> },
        ],
      },
      {
        category: 'My Team',
        items: [
          { label: 'Team Members', path: '/manager/team-members', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Team Overview', path: '/manager/team-overview', icon: <Network size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Attendance',
        items: [
          { label: 'Team Attendance', path: '/manager/team-attendance', icon: <Calendar size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Attendance History', path: '/manager/attendance-history', icon: <History size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Corrections', path: '/manager/corrections', icon: <CheckSquare size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Approvals', path: '/manager/approvals', icon: <ShieldAlert size={18} strokeWidth={2} className="text-red-400" /> },
        ],
      },
      {
        category: 'Skills',
        items: [
          { label: 'Team Skills', path: '/manager/team-skills', icon: <Compass size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Skill Gaps', path: '/manager/skills-gaps-view', icon: <Target size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Skill Coverage', path: '/manager/skills-coverage', icon: <Map size={18} strokeWidth={2} className="text-indigo-400" /> },
        ],
      },
      {
        category: 'Performance',
        items: [
          { label: 'Team Performance', path: '/manager/team-performance', icon: <Star size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Productivity', path: '/manager/productivity-metrics', icon: <Activity size={18} strokeWidth={2} className="text-emerald-400" /> },
        ],
      },
      {
        category: 'Shifts',
        items: [
          { label: 'Team Shifts', path: '/manager/shifts', icon: <Timer size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Reports',
        items: [
          { label: 'Reports', path: '/manager/reports', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Settings',
        items: [
          { label: 'Settings', path: '/manager/settings', icon: <Sliders size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Help & Support',
        items: [
          { label: 'Help & Support', path: '#support', icon: <HelpCircle size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
    ],

    [Role.TEAM_LEAD]: [
      {
        category: 'Dashboard',
        items: [
          { label: 'Dashboard', path: '/team-lead/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'Team Analytics',
        items: [
          { label: 'Attendance', path: '/team-lead/attendance-analytics', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" /> },
          { label: 'Productivity', path: '/team-lead/productivity', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Performance', path: '/team-lead/performance', icon: <TrendingUp size={18} strokeWidth={2} className="text-purple-400" /> },
          { label: 'Workforce', path: '/team-lead/workforce-analytics', icon: <BarChart3 size={18} strokeWidth={2} className="text-indigo-400" /> },
        ],
      },
      {
        category: 'My Team',
        items: [
          { label: 'Team Members', path: '/team-lead/team-members', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Team Overview', path: '/team-lead/team-overview', icon: <Network size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Attendance',
        items: [
          { label: 'Team Attendance', path: '/team-lead/team-attendance', icon: <Calendar size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Attendance History', path: '/team-lead/attendance-history', icon: <History size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Corrections', path: '/team-lead/corrections', icon: <CheckSquare size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Approvals', path: '/team-lead/approvals', icon: <ShieldAlert size={18} strokeWidth={2} className="text-red-400" /> },
        ],
      },
      {
        category: 'Skills',
        items: [
          { label: 'Team Skills', path: '/team-lead/team-skills', icon: <Compass size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Skill Gaps', path: '/team-lead/skills-gaps', icon: <Target size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Performance',
        items: [
          { label: 'Team Performance', path: '/team-lead/team-performance', icon: <Star size={18} strokeWidth={2} className="text-amber-400" /> },
        ],
      },
      {
        category: 'Shifts',
        items: [
          { label: 'Team Shifts', path: '/team-lead/shifts', icon: <Timer size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'Reports',
        items: [
          { label: 'Reports', path: '/team-lead/reports', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'Settings',
        items: [
          { label: 'Settings', path: '/team-lead/settings', icon: <Sliders size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Help & Support',
        items: [
          { label: 'Help & Support', path: '#support', icon: <HelpCircle size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
    ],

    [Role.EMPLOYEE]: [
      {
        category: 'Dashboard',
        items: [
          { label: 'Dashboard', path: '/employee/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'My Attendance',
        items: [
          { label: 'Today\'s Attendance', path: '/employee/attendance-today', icon: <Calendar size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'Check-In / Check-Out', path: '/employee/check-in-out', icon: <Clock size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Break', path: '/employee/break', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Attendance History', path: '/employee/attendance', icon: <History size={18} strokeWidth={2} className="text-rose-400" /> },
          { label: 'Working Hours', path: '/employee/working-hours', icon: <Timer size={18} strokeWidth={2} className="text-emerald-400" /> },
        ],
      },
      {
        category: 'My Shifts',
        items: [
          { label: 'Shift Schedule', path: '/employee/shifts', icon: <ClipboardList size={18} strokeWidth={2} className="text-teal-400" /> },
        ],
      },
      {
        category: 'My Skills',
        items: [
          { label: 'Skills', path: '/employee/skills', icon: <Compass size={18} strokeWidth={2} className="text-cyan-400" /> },
          { label: 'Skill Coverage', path: '/employee/skills-coverage', icon: <Map size={18} strokeWidth={2} className="text-indigo-400" /> },
          { label: 'Skill Gaps', path: '/employee/skills-gaps', icon: <Target size={18} strokeWidth={2} className="text-rose-400" /> },
        ],
      },
      {
        category: 'My Performance',
        items: [
          { label: 'Performance', path: '/employee/performance', icon: <Star size={18} strokeWidth={2} className="text-amber-400" /> },
        ],
      },
      {
        category: 'Attendance Requests',
        items: [
          { label: 'Correction Requests', path: '/employee/corrections', icon: <FileText size={18} strokeWidth={2} className="text-blue-400" /> },
        ],
      },
      {
        category: 'My Profile',
        items: [
          { label: 'My Profile', path: '/employee/profile', icon: <User size={18} strokeWidth={2} className="text-emerald-400" /> },
        ],
      },
      {
        category: 'Settings',
        items: [
          { label: 'Settings', path: '/employee/settings', icon: <Sliders size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
      {
        category: 'Help & Support',
        items: [
          { label: 'Help & Support', path: '#support', icon: <HelpCircle size={18} strokeWidth={2} className="text-slate-400" /> },
        ],
      },
    ],
  };

  const { theme, toggleTheme } = useTheme();
  const activeRole = role as Role;
  const currentCategories = roleCategorizedNavMap[activeRole] || roleCategorizedNavMap[Role.EMPLOYEE];
  const roleAccent = ROLE_ACCENTS[activeRole] || ROLE_ACCENTS[Role.EMPLOYEE];
  const roleLabel = ROLE_LABELS[activeRole] || ROLE_LABELS[Role.EMPLOYEE];
  const isDark = theme === 'dark';

  const visibleCategories = (() => {
    const query = navigationQuery.trim().toLowerCase();
    if (!query) return currentCategories;

    return currentCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${category.category} ${item.label}`.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0);
  })();

  const getBadgeStyle = (variant: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose') => {
    switch (variant) {
      case 'blue':
        return isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'purple':
        return isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'amber':
        return isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200';
      case 'emerald':
        return isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'rose':
        return isDark ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      {/* Mobile Off-Canvas Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-label="Close Off-Canvas Drawer"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Role-aware workspace navigation */}
      <aside
        aria-label="Primary navigation"
        className={`app-sidebar ${roleAccent.className} border-r flex flex-col shrink-0 fixed md:sticky left-0 z-30 transition-all duration-300 ease-in-out font-sans ${
          collapsed ? 'sidebar-is-collapsed w-[76px]' : 'sidebar-is-expanded w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >


        {/* Sidebar Navigation Items List */}
        <nav className="sidebar-nav sidebar-nav-scroll flex-1 overflow-y-auto w-full scrollbar-thin">
          {visibleCategories.map((cat: NavigationCategory, groupIdx: number) => {
            return (
              <React.Fragment key={groupIdx}>
                {/* Subtle Divider Line Between Logical Groups */}
                {groupIdx > 0 && !collapsed && (
                  <div className="sidebar-group-separator" />
                )}

                {/* Section Header Title */}
                {!collapsed && cat.category && cat.category !== 'General' && cat.category !== 'Dashboard' && cat.category !== 'Settings' && cat.category !== 'Help & Support' && (
                  <div className="sidebar-section-label">
                    <span />
                    {cat.category}
                  </div>
                )}

                {/* Clean Navigation Links */}
                {cat.items.map((item: NavigationItem) => {
                  const active = item.path !== '#support' && (
                    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  );

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(event) => {
                        if (item.path === '#support') {
                          event.preventDefault();
                          onOpenSupport();
                        }
                        setMobileOpen(false);
                      }}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={`sidebar-nav-link flex items-center gap-3 transition-all duration-200 group relative no-underline text-inherit ${
                        active
                          ? 'is-active'
                          : ''
                      } ${collapsed ? 'is-collapsed justify-center' : ''}`}
                    >
                      <span className="sidebar-icon-shell shrink-0 transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>

                      {!collapsed && (
                        <>
                          <span className="sidebar-link-label font-bold text-xs tracking-tight truncate flex-1 min-w-0">
                            {item.label}
                          </span>
                          <ChevronRight size={14} className="sidebar-link-arrow shrink-0" />
                        </>
                      )}

                      {/* Unread Badge Counter */}
                      {!collapsed && item.badge && (
                        <span
                          className={`sidebar-badge px-1.5 py-0.5 text-[10px] font-extrabold rounded-md border ml-auto shrink-0 ${getBadgeStyle(
                            item.badge.variant
                          )}`}
                        >
                          {item.badge.text}
                        </span>
                      )}

                      {/* Collapsed Hover Tooltip */}
                      {collapsed && (
                        <span className="sidebar-tooltip">
                          {item.label}
                          {item.badge && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${getBadgeStyle(item.badge.variant)}`}>
                              {item.badge.text}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </React.Fragment>
            );
          })}
          {visibleCategories.length === 0 && (
            <p className="px-3 py-6 text-center text-xs font-semibold text-[var(--text-muted)]">
              No navigation items found.
            </p>
          )}
        </nav>

        <div className={`sidebar-footer ${collapsed ? 'is-collapsed' : ''}`}>

          <div className="sidebar-footer-actions">
            <button
              type="button"
              className="sidebar-footer-button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {!collapsed && <span>{isDark ? 'Light theme' : 'Dark theme'}</span>}
            </button>
            {!collapsed && (
              <button
                type="button"
                className="sidebar-footer-button sidebar-footer-collapse"
                onClick={() => setCollapsed(true)}
              >
                <PanelLeftClose size={16} />
                <span>Collapse menu</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

