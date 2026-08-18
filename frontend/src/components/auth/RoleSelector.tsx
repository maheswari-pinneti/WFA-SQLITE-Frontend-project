import React from 'react';
import { RoleType } from '../../theme/roles';

interface RoleOption {
  value: RoleType;
  label: string;
  description: string;
  icon: string;
}

const roleOptions: RoleOption[] = [
  { value: 'EMPLOYEE', label: 'Employee', description: 'Personal workforce access & tracker', icon: '👤' },
  { value: 'TEAM_LEAD', label: 'Team Lead', description: 'Team attendance & schedule manager', icon: '🎯' },
  { value: 'MANAGER', label: 'Manager', description: 'Department analytics & reports access', icon: '📊' },
  { value: 'HR', label: 'HR Manager', description: 'Full Human Resources admin authority', icon: '👩‍💼' },
  { value: 'ADMIN', label: 'Admin', description: 'Full organization configuration & controls', icon: '👑' }
];

interface RoleSelectorProps {
  selectedRole: RoleType;
  onChange: (role: RoleType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--text-primary)]">
        Select your role
      </label>
      <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {roleOptions.map((opt) => {
          const isSelected = selectedRole === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none ${
                isSelected
                  ? 'border-[var(--role-primary)] bg-[var(--role-background)] ring-2 ring-[var(--role-primary)]/10 shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <span className="text-xl shrink-0">{opt.icon}</span>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isSelected ? 'text-[var(--role-text)]' : 'text-[var(--text-primary)]'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
