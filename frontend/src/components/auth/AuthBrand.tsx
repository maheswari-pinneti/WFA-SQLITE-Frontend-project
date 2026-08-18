import React from 'react';
import { StacklyLogo } from '../common/StacklyLogo';

export const AuthBrand: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      <StacklyLogo size={40} showText={false} />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          STACKLY
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] opacity-80">
          Workforce Intelligence
        </p>
      </div>
    </div>
  );
};

export default AuthBrand;
