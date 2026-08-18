import React, { useState } from 'react';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  showStrength?: boolean;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  label = 'Password',
  name = 'password',
  placeholder = '••••••••',
  showStrength = false,
  required = false
}) => {
  const [show, setShow] = useState(false);

  // Requirement checks
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value)
  };

  const strengthCount = Object.values(checks).filter(Boolean).length;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  if (strengthCount >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  } else if (strengthCount >= 3) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-xs font-semibold text-[var(--role-primary)] hover:underline focus:outline-none"
        >
          {show ? 'Hide password' : 'Show password'}
        </button>
      </div>

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
        />
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-2 pt-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-medium">Strength: {strengthLabel}</span>
            <span className="text-[var(--text-muted)] font-semibold">{strengthCount}/5</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColor} transition-all duration-300`}
              style={{ width: `${(strengthCount / 5) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--text-muted)] font-medium">
            <div className="flex items-center gap-1.5">
              <span className={checks.length ? 'text-emerald-500' : 'text-slate-400'}>✓</span>
              <span>Min 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={checks.upper ? 'text-emerald-500' : 'text-slate-400'}>✓</span>
              <span>Uppercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={checks.lower ? 'text-emerald-500' : 'text-slate-400'}>✓</span>
              <span>Lowercase letter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={checks.number ? 'text-emerald-500' : 'text-slate-400'}>✓</span>
              <span>Number</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={checks.special ? 'text-emerald-500' : 'text-slate-400'}>✓</span>
              <span>Special character</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
