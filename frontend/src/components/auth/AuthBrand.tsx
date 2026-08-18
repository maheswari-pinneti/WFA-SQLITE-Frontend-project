import React from 'react';

export const AuthBrand: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Sleek SVG Logo for WorkSphere */}
      <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-md overflow-hidden">
        <img
          src="/assets/images/logo.png"
          alt="WorkSphere Logo"
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          WorkSphere
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] opacity-80">
          Workforce Intelligence
        </p>
      </div>
    </div>
  );
};

export default AuthBrand;
