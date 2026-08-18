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
    <div className="auth-form-group">
      <label className="auth-label">
        Select your role
      </label>
      <select
        value={selectedRole}
        onChange={(e) => onChange(e.target.value as RoleType)}
        className="auth-select"
      >
        {roleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.icon} {opt.label} - {opt.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;
