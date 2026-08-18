import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS } from '../../../security/roles/roles';
import { getRoleBadgeClass } from '../../utils/helpers';
import { StacklyLogo } from '../../../components/common/StacklyLogo';
import { LogoutModal } from '../../../auth/components/LogoutModal';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ShieldIcon from '@mui/icons-material/Shield';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';
import LayersIcon from '@mui/icons-material/Layers';

interface EnterpriseHeaderProps {
  onToggleSidebar: () => void;
  onOpenHelp?: () => void;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({ onToggleSidebar, onOpenHelp }) => {
  const { user, role, logout, permissions } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'all' | 'employees' | 'departments' | 'reports' | 'security'>('all');

  // Notifications State
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Attendance Alert: 3 Late Clock-Ins', subtitle: 'HR Operations', time: '5m ago', type: 'warning', path: '/hr/attendance', read: false },
    { id: '2', title: 'Leave Request Pending Review', subtitle: 'Sarah Connor (Engineering)', time: '45m ago', type: 'info', path: '/manager/approvals', read: false },
    { id: '3', title: 'System Security Audit Completed', subtitle: 'Compliance Stream', time: '2h ago', type: 'success', path: '/admin/audit-logs', read: false },
  ]);

  // Dropdowns State
  const [activeDropdown, setActiveDropdown] = useState<'profile' | 'role' | 'notif' | 'messages' | null>(null);

  // Scope & Modal States
  const [showPermissionsPreview, setShowPermissionsPreview] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const searchResultsMap = [
    { title: 'Global Headcount & Department Analytics', category: 'reports', path: '/admin/analytics' },
    { title: 'User Management & Security Scopes', category: 'security', path: '/admin/users' },
    { title: 'System Security Audit Stream', category: 'security', path: '/admin/audit-logs' },
    { title: 'Workforce Attendance Roster', category: 'employees', path: '/hr/attendance' },
    { title: 'Performance Review Matrix', category: 'employees', path: '/hr/performance' },
    { title: 'Engineering & Product Teams', category: 'departments', path: '/admin/departments' },
  ];



  const toggleDropdown = (name: 'profile' | 'role' | 'notif' | 'messages') => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleSearchSubmit = (path: string) => {
    setSearchFocused(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setActiveDropdown(null);
    logout();
    navigate('/login', { replace: true });
  };

  // Compute Breadcrumb Trail
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', path: '/' }];
    
    return segments.map((seg, idx) => {
      const url = `/${segments.slice(0, idx + 1).join('/')}`;
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
      return { label: formatted, path: url };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const filteredSearchResults = searchResultsMap.filter((item) => {
    const matchesCategory = searchCategory === 'all' || item.category === searchCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const isDark = theme === 'dark';

  return (
    <header className={`app-header h-16 px-4 flex items-center justify-between sticky top-0 z-40 w-full shrink-0 transition-colors border-b overflow-visible ${
      isDark ? 'bg-[#0B1120] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* LEFT SECTION: Logo & Breadcrumb Navigation */}
      <div className="header-brand flex items-center gap-3 md:gap-4 shrink-0 min-w-0">

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="header-menu-button p-2 rounded-xl border cursor-pointer"
        >
          <MenuIcon style={{ fontSize: 18 }} />
        </button>

        {/* STACKLY Brand Logo */}
        <Link to="/" className="shrink-0 flex items-center hover:opacity-90 transition-opacity">
          <StacklyLogo size={34} />
        </Link>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0 pl-2 border-l border-slate-800/80">
          <Link to="/" className="text-slate-400 hover:text-blue-400 flex items-center gap-1">
            <HomeIcon style={{ fontSize: 13 }} />
          </Link>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.path}>
              <ChevronRightIcon className="text-slate-500" style={{ fontSize: 12 }} />
              <span className={`truncate max-w-[130px] ${
                idx === breadcrumbs.length - 1 ? 'font-bold text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CENTER SECTION: Global Command Search Surface */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3.5 text-slate-400 pointer-events-none" style={{ fontSize: 16 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search employees, departments, reports..."
            style={{ paddingLeft: '2.5rem' }}
            className={`w-full rounded-2xl pl-10 pr-4 py-2 text-xs transition-all outline-none border ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900'
                : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
            }`}
          />
        </div>

        {/* Global Search Results Overlay */}
        {searchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 rounded-2xl animate-fadeIn space-y-2 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <SearchIcon className="text-blue-400" style={{ fontSize: 12 }} /> Command Palette Search
              </span>
              <button onClick={() => setSearchFocused(false)} className="text-slate-400 hover:text-white">
                <CloseIcon style={{ fontSize: 14 }} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['all', 'employees', 'departments', 'reports', 'security'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-xl font-bold capitalize transition-all cursor-pointer ${
                    searchCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 max-h-64 overflow-y-auto space-y-1.5">
              {filteredSearchResults.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No matching results found</p>
              ) : (
                filteredSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(res.path)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/90 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400">{res.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{res.category}</p>
                    </div>
                    <ChevronRightIcon className="text-slate-500 group-hover:text-blue-400" style={{ fontSize: 14 }} />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Quick Actions, Theme, Notifications & User Profile Menu */}
      <div className="header-actions flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Language Flag Selector */}
        <button
          type="button"
          aria-label="Select Language"
          className={`p-2 rounded-xl border transition-all cursor-pointer text-sm flex items-center justify-center ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title="Language: English (UK)"
        >
          🇬🇧
        </button>

        {/* 1. Notifications Center */}
        <div className="header-action-wrap relative">
          <button
            onClick={() => toggleDropdown('notif')}
            aria-label="View Notifications"
            className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Notifications & System Alerts"
          >
            <NotificationsIcon style={{ fontSize: 18 }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#f43f5e',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                className="animate-pulse"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {activeDropdown === 'notif' && (
            <div className="header-popover header-notifications absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 rounded-2xl text-xs text-slate-100 animate-fadeIn space-y-2 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-sm text-white">Notifications ({unreadCount})</span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-blue-400 hover:underline font-bold"
                >
                  Mark All Read
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                      setActiveDropdown(null);
                      navigate(n.path);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      n.read
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-75'
                        : 'bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-100">{n.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>{n.subtitle}</span>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Messages Icon */}
        <button
          onClick={() => toggleDropdown('messages')}
          aria-label="View Messages"
          className={`p-2 rounded-xl border transition-all hidden sm:block cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Team Messages"
        >
          <ChatIcon style={{ fontSize: 18 }} />
        </button>

        {/* 3. Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light or Dark Theme"
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <LightModeIcon className="text-amber-400" style={{ fontSize: 18 }} /> : <DarkModeIcon className="text-blue-400" style={{ fontSize: 18 }} />}
        </button>

        {/* 4. Help Icon */}
        <button
          onClick={onOpenHelp}
          aria-label="Help & IT Desk Support"
          className={`p-2 rounded-xl border transition-all hidden md:block cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="24/7 Enterprise Help Desk"
        >
          <HelpIcon style={{ fontSize: 18 }} />
        </button>

        {/* 5. User Profile Menu Container */}
        {user && (
          <div className="header-profile relative border-l border-slate-800/80 pl-2.5 ml-1 shrink-0">
            <button
              onClick={() => navigate('/employee/profile')}
              aria-label="User Profile Menu"
              className="flex items-center gap-2 focus:outline-none group cursor-pointer p-1 rounded-xl hover:bg-slate-800/50 transition-colors"
              title={`${user.name} (${ROLE_LABELS[role]})`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/80 group-hover:border-blue-400 transition-all shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <KeyboardArrowDownIcon className="text-slate-400 group-hover:text-white transition-colors shrink-0" style={{ fontSize: 14 }} />
            </button>

            {/* STRICTLY CONSTRAINED USER PROFILE DROPDOWN MENU */}
            {activeDropdown === 'profile' && (
              <div className="header-popover absolute right-0 top-full mt-2 w-80 max-w-[320px] bg-slate-900 border border-slate-800 p-3.5 shadow-2xl z-50 rounded-2xl text-xs text-slate-100 animate-fadeIn space-y-3 font-sans overflow-hidden">
                {/* Profile Header */}
                <div className="px-2 py-1 border-b border-slate-800 space-y-1">
                  <p className="font-extrabold text-sm text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <span className={`badge ${getRoleBadgeClass(role)}`}>{ROLE_LABELS[role]}</span>
                    <button
                      onClick={() => setShowPermissionsPreview(!showPermissionsPreview)}
                      className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LayersIcon style={{ fontSize: 12 }} /> {showPermissionsPreview ? 'Hide' : 'Permissions'}
                    </button>
                  </div>
                </div>

                {/* Permissions Expandable Box (Strictly Constrained) */}
                {showPermissionsPreview && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] space-y-1 max-h-32 overflow-y-auto max-w-full">
                    <p className="font-extrabold text-slate-400 uppercase tracking-wider">Active Permissions ({permissions.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {permissions.map((p, idx) => (
                        <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono text-[9px] truncate max-w-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Actions List */}
                <div className="py-1 space-y-1 font-medium">
                  <button
                    onClick={() => { navigate('/employee/profile'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 transition-colors cursor-pointer"
                  >
                    <PersonIcon className="text-blue-400 shrink-0" style={{ fontSize: 16 }} /> View Profile
                  </button>
                  <button
                    onClick={() => { navigate('/admin/settings'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="text-indigo-400 shrink-0" style={{ fontSize: 16 }} /> Account Settings
                  </button>
                  <button
                    onClick={() => { navigate('/admin/users'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 transition-colors cursor-pointer"
                  >
                    <ShieldIcon className="text-purple-400 shrink-0" style={{ fontSize: 16 }} /> Access Control Matrix
                  </button>
                </div>

                {/* Log Out Action */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleConfirmLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-2.5 font-extrabold transition-colors cursor-pointer"
                  >
                    <LogoutIcon className="shrink-0 text-rose-400" style={{ fontSize: 16 }} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </header>
  );
};
