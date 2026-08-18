import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export const AuthFooter: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-footer">
      <div className="auth-footer-links">
        <a href="#privacy" className="auth-link">Privacy Policy</a>
        <a href="#terms" className="auth-link">Terms</a>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="auth-theme-toggle"
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
};

export default AuthFooter;
