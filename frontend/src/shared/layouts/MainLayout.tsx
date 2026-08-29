import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { EnterpriseHeader } from './components/EnterpriseHeader';
import { Sidebar } from './components/Sidebar';
import { SupportModal } from '../components/SupportModal';
import { useTheme } from '../../design-system/theme/theme';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const { setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Initialize collapsed state from localStorage (default to false / expanded on desktop)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save collapsed state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Set the default theme mode based on role recommendations ONLY when the role changes
  useEffect(() => {
    const lastInitializedRole = sessionStorage.getItem('wfa_initialized_role');
    if (lastInitializedRole !== role) {
      if (role === 'HR' || role === 'EMPLOYEE' || role === 'MANAGER') {
        setTheme('light');
      } else if (role === 'ADMIN' || role === 'TEAM_LEAD') {
        setTheme('dark');
      }
      sessionStorage.setItem('wfa_initialized_role', role);
    }
  }, [role, setTheme]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const getThemeClass = (userRole: string) => {
    switch (userRole) {
      case 'HR': return 'earth-theme';
      case 'EMPLOYEE': return 'arctic-theme';
      case 'TEAM_LEAD': return 'midnight-theme';
      case 'MANAGER': return 'indigo-theme';
      case 'ADMIN': return 'sunset-theme';
      default: return 'emerald-theme';
    }
  };

  const themeClass = getThemeClass(role);

  return (
    <div data-role={role} className={`app-shell ${themeClass} h-screen min-h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300`}>
      {/* Fixed Enterprise Header at root level spanning full width */}
      <EnterpriseHeader onToggleSidebar={toggleSidebar} onOpenHelp={() => setSupportModalOpen(true)} />

      {/* Main Body Wrapper (Below Header) */}
      <div className="main-body flex-1 flex overflow-hidden w-full relative">
        {/* Sleek Dynamic Modular Sidebar Navigation */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onOpenSupport={() => setSupportModalOpen(true)}
        />

        {/* Main Content Area: Content */}
        <main className="app-main flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* Small footprint dashboard footer spanning full width */}
      <footer className="app-footer shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-4 flex items-center justify-between text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} Workforce Analytics. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setSupportModalOpen(true)}>Support</span>
          <span>v1.0.0</span>
        </div>
      </footer>


      {/* Support & IT Helpdesk Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  );
};

