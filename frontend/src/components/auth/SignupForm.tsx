import React, { useState } from 'react';
import PasswordField from './PasswordField';
import RoleSelector from './RoleSelector';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import { RoleType } from '../../theme/roles';
import { authService } from '../../auth/services/auth.service';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      await onSubmit({
        fullName,
        email,
        department,
        roleType: 'EMPLOYEE',
        password
      });
      setIsSuccess(true);
    } catch (err: any) {
      setIsSuccess(false);
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-space-y-6">
      <AuthHeader
        title="Create Account"
        subtitle="Register your corporate profile to access Workforce Analytics"
      />

      {error && (
        <div className="auth-alert-error">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="auth-alert-success">
          Account created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-space-y-4">
        {/* Full Name */}
        <div className="auth-form-group">
          <label className="auth-label">
            Full Name
          </label>
          <input
            type="text"
            required
            disabled={isLoading || isSuccess}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sarah Connor"
            className="auth-input"
          />
        </div>

        {/* Corporate Email */}
        <div className="auth-form-group">
          <label className="auth-label">
            Corporate Email
          </label>
          <input
            type="email"
            required
            disabled={isLoading || isSuccess}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah.connor@thestackly.com"
            className="auth-input"
          />
        </div>

        {/* Department Selection */}
        <div className="auth-form-group">
          <label className="auth-label">
            Department
          </label>
          <select
            value={department}
            disabled={isLoading || isSuccess}
            onChange={(e) => setDepartment(e.target.value)}
            className="auth-select"
          >
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Operations">Finance & Operations</option>
            <option value="Customer Success">Customer Success</option>
          </select>
        </div>

        {/* Public role selection is disabled. All new signups default to EMPLOYEE. */}

        {/* Password */}
        <div>
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <PasswordField
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm Password"
            required
          />
        </div>

        {/* Terms of Service */}
        <label className="auth-checkbox-label" style={{ fontSize: '0.75rem', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={agreeTerms}
            disabled={isLoading || isSuccess}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="auth-checkbox"
            style={{ marginTop: '0.125rem' }}
          />
          <span>
            I agree to the <a href="#terms" className="auth-link">Terms of Service</a> and <a href="#privacy" className="auth-link">Privacy Policy</a>.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="auth-btn-primary"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or connect with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              sessionStorage.setItem('sso_provider', 'microsoft');
              const redirectUrl = await authService.getMicrosoftLoginUrl();
              window.location.href = redirectUrl;
            } catch (err: any) {
              setError(err.message || 'Failed to trigger Microsoft login');
            }
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#ffffff', color: '#1f2937', fontWeight: 600, padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 23 23" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path fill="#F25022" d="M0 0h11v11H0z" />
            <path fill="#7FBA00" d="M12 0h11v11H12z" />
            <path fill="#00A4EF" d="M0 12h11v11H0z" />
            <path fill="#FFB900" d="M12 12h11v11H12z" />
          </svg>
          Microsoft
        </button>
      </form>

      <AuthFooter />
    </div>
  );
};

export default SignupForm;
