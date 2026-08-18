import React from 'react';
import './Auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  selectedRole?: any;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
