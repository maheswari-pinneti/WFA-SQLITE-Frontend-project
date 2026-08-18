import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="auth-header">
      <div className="auth-title-container">
        <img src="/assets/images/logo.png" alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
      </div>
      <h2 className="auth-title">
        {title}
      </h2>
      <p className="auth-subtitle">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
