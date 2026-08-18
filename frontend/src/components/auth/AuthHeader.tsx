import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="text-sm text-[var(--text-muted)] font-medium">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
