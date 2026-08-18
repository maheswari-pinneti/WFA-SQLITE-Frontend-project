import React, { useState } from 'react';
import PasswordField from './PasswordField';
import RoleSelector from './RoleSelector';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import { RoleType } from '../../theme/roles';

interface SignupFormProps {
  selectedRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onSubmit: (data: any) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ selectedRole, onRoleChange, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.toLowerCase().endsWith('@thestackly.com') && !email.toLowerCase().endsWith('@company.com')) {
      setError('Only official company email addresses (@thestackly.com or @company.com) are permitted.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    setIsSuccess(true);
    onSubmit({
      fullName,
      email,
      department,
      roleType: selectedRole,
      password
    });
  };

  return (
    <div className="space-y-6">
      <AuthHeader
        title="Create Account"
        subtitle="Register your corporate profile to access Workforce Analytics"
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          Account created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sarah Connor"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
          />
        </div>

        {/* Corporate Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Corporate Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah.connor@thestackly.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
          />
        </div>

        {/* Department Selection */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20 focus:border-[var(--role-primary)] transition"
          >
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Operations">Finance & Operations</option>
            <option value="Customer Success">Customer Success</option>
          </select>
        </div>

        {/* Role Selector */}
        <RoleSelector
          selectedRole={selectedRole}
          onChange={onRoleChange}
        />

        {/* Password */}
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          required
        />

        {/* Confirm Password */}
        <PasswordField
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm Password"
          required
        />

        {/* Terms of Service */}
        <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--role-primary)] focus:ring-[var(--role-primary)]/20 mt-0.5"
          />
          <span>
            I agree to the <a href="#terms" className="text-[var(--role-primary)] font-semibold hover:underline">Terms of Service</a> and <a href="#privacy" className="text-[var(--role-primary)] font-semibold hover:underline">Privacy Policy</a>.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl font-bold bg-[var(--role-primary)] text-white hover:bg-[var(--role-primary)]/90 active:scale-[0.98] transition select-none shadow-md"
        >
          Sign Up
        </button>
      </form>

      <AuthFooter />
    </div>
  );
};

export default SignupForm;
