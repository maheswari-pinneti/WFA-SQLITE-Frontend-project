import React from 'react';

export const AuthBrand: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Sleek SVG Logo for WorkSphere */}
      <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--role-primary,var(--bg-hover))] to-[var(--role-secondary,var(--bg-hover))] shadow-md transition-all duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5.5 h-5.5 drop-shadow-sm"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-[var(--role-primary,var(--bg-hover))] to-[var(--role-secondary,var(--bg-hover))] opacity-35 blur-sm -z-10 animate-pulse"></div>
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
