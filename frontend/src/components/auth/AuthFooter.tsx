import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export const AuthFooter: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] font-medium">
      <div className="flex gap-4">
        <a href="#privacy" className="hover:text-[var(--role-primary)] transition">Privacy Policy</a>
        <a href="#terms" className="hover:text-[var(--role-primary)] transition">Terms of Service</a>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition"
      >
        <span>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
      </button>
    </div>
  );
};

export default AuthFooter;
