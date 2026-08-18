import React from 'react';
import { AuthBrand } from './AuthBrand';
import { RolePanel } from './RolePanel';
import { AuthIllustration } from './AuthIllustration';
import { RoleType } from '../../theme/roles';

interface AuthLayoutProps {
  children: React.ReactNode;
  selectedRole: RoleType;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, selectedRole }) => {
  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="w-full flex flex-col md:flex-row">
        {/* Left Side: Brand & Role info - 42% on desktop */}
        <div className="w-full md:w-[42%] bg-slate-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] overflow-hidden relative min-h-[360px] md:min-h-screen">
          {/* Company Brand at top */}
          <div className="p-6 md:p-8 z-10">
            <AuthBrand />
          </div>

          {/* Dynamic illustration in center on desktop */}
          <div className="hidden md:flex justify-center items-center px-8 z-10">
            <AuthIllustration role={selectedRole} />
          </div>

          {/* Dynamic Role Detail Panel */}
          <div className="p-6 md:p-8 md:pt-0 z-10 flex-1 md:flex-initial">
            <RolePanel role={selectedRole} />
          </div>
        </div>

        {/* Right Side: Form Content - 58% on desktop */}
        <div className="w-full md:w-[58%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-[480px] space-y-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
