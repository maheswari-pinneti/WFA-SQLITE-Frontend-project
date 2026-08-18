import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  selectedRole?: any;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-[#f8fafc] p-6 select-none">
      <div className="w-full max-w-[440px] bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-[#334155]">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
