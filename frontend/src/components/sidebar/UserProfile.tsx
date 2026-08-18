import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROLE_LABELS } from '../../security/roles/roles';
import { User, Settings, LogOut, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoutModal } from '../../auth/components/LogoutModal';

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ collapsed }) => {
  const { user, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <div ref={dropdownRef} className="sidebar-profile relative font-sans">
      {/* Profile Card Trigger */}
      <div
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`sidebar-profile-trigger flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-all ${
          collapsed ? 'justify-center p-1.5' : ''
        }`}
      >
        <div className="relative shrink-0">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
        </div>

        {!collapsed && (
          <div className="sidebar-profile-meta flex-1 min-w-0 space-y-0.5">
            <div className="sidebar-profile-name-row flex items-center justify-between">
              <p className="sidebar-profile-name text-xs font-black text-white truncate">{user.name || 'David Sterling'}</p>
              <span className="sidebar-profile-status text-[9.5px] font-bold text-emerald-400">Active</span>
            </div>
            <p className="sidebar-profile-role text-[10px] font-bold text-blue-400 truncate">{user.title || ROLE_LABELS[role] || 'Department Manager'}</p>
            <p className="sidebar-profile-dept text-[9.5px] font-medium text-slate-400 truncate">
              {user.department || 'Engineering'}
            </p>
          </div>
        )}

        {!collapsed && (
          <ChevronUp
            size={14}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-blue-400' : ''
            }`}
          />
        )}
      </div>

      {/* Upward Opening Profile Drill-down Popup Menu */}
      {dropdownOpen && (
        <div className="absolute left-3 right-3 bottom-full mb-2 bg-slate-900 border border-slate-700/90 p-2 shadow-2xl z-50 rounded-2xl space-y-1 text-xs text-slate-100 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              navigate('/admin/profile');
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-200 hover:text-white transition-colors"
          >
            <User size={14} className="text-blue-400" /> View Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              navigate('/admin/settings');
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-200 hover:text-white transition-colors"
          >
            <Settings size={14} className="text-indigo-400" /> System Settings
          </button>
          <div className="border-t border-slate-800 pt-1">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-400 font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Portaled Fullscreen Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
};
