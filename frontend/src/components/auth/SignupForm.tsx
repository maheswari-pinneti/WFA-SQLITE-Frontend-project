import React, { useState } from 'react';
import PasswordField from './PasswordField';
import RoleSelector from './RoleSelector';
import AuthHeader from './AuthHeader';
import AuthFooter from './AuthFooter';
import { RoleType } from '../../theme/roles';
import { authService } from '../../auth/services/auth.service';
import { useAuth } from '../../auth/hooks/useAuth';

interface SignupFormProps {
  selectedRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onSubmit: (data: any) => Promise<any>;
}

export const SignupForm: React.FC<SignupFormProps> = ({ selectedRole, onRoleChange, onSubmit }) => {
  const { verifyMfa } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // MFA Setup states
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string; challengeId: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

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
      const res = await onSubmit({
        fullName,
        email,
        department,
        roleType: 'EMPLOYEE',
        password
      });
      if (res && res.data && res.data.requiresMfaSetup) {
        setSetupData({
          secret: res.data.secret,
          qrCodeDataUrl: res.data.qrCodeDataUrl,
          otpauthUrl: res.data.otpauthUrl,
          challengeId: res.data.challengeId
        });
        setRequiresMfaSetup(true);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData || !totpCode) return;
    setError('');
    setIsLoading(true);
    try {
      const verifyRes = (await verifyMfa(setupData.challengeId, totpCode)) as any;
      if (verifyRes && verifyRes.recoveryCodes && verifyRes.recoveryCodes.length > 0) {
        setRecoveryCodes(verifyRes.recoveryCodes);
      }
    } catch (err: any) {
      setError(err.message || 'MFA Code verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (recoveryCodes.length > 0) {
    return (
      <div className="auth-space-y-6">
        <AuthHeader
          title="Account Secured"
          subtitle="Two-Factor Authentication is now enabled"
        />
        <div className="auth-alert-success" style={{ textAlign: 'center', fontWeight: 'bold' }}>
          🎉 MFA Registration Successful!
        </div>
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--role-primary)', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>⚠️ IMPORTANT: Store these 10 one-time recovery codes safely!</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>If you lose access to your authenticator app, you can use these codes to log in.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>
            {recoveryCodes.map((code, idx) => (
              <div key={idx} style={{ padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                {code}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => {
              const text = recoveryCodes.join('\n');
              navigator.clipboard.writeText(text);
              alert('Recovery codes copied to clipboard.');
            }}
            className="auth-btn-primary"
            style={{ background: 'var(--border-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', marginTop: '0.5rem', cursor: 'pointer' }}
          >
            Copy to Clipboard
          </button>
        </div>
        
        <button
          type="button"
          onClick={() => {
            window.location.reload(); // Reload or let parent route handle it
          }}
          className="auth-btn-primary"
          style={{ cursor: 'pointer' }}
        >
          Proceed to Dashboard
        </button>
      </div>
    );
  }

  if (requiresMfaSetup) {
    return (
      <div className="auth-space-y-6">
        <AuthHeader
          title="Secure Your Account"
          subtitle="Configure Multi-Factor Authentication (MFA)"
        />

        {error && (
          <div className="auth-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyMfa} className="auth-space-y-6">
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>Scan this QR code with Google Authenticator or Microsoft Authenticator</p>
            {setupData && (
              <>
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="Setup QR Code"
                  style={{ width: '9rem', height: '9rem', border: '1px solid var(--border-color)', padding: '0.25rem', borderRadius: '8px', background: 'white' }}
                />
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>Or enter the secret key manually:</p>
                  <code style={{ fontSize: '0.8125rem', fontWeight: 'bold', display: 'block', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', wordBreak: 'break-all', userSelect: 'all' }}>
                    {setupData.secret}
                  </code>
                </div>
              </>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="setupTotpCode" className="auth-label" style={{ marginBottom: '0.5rem', display: 'block', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
              Enter 6-Digit Authenticator Code
            </label>
            <input
              id="setupTotpCode"
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="auth-input"
              style={{ textAlign: 'center', letterSpacing: '0.1em', fontSize: '1.25rem', padding: '0.75rem' }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || totpCode.length !== 6}
            className="auth-btn-primary"
            style={{ cursor: 'pointer' }}
          >
            {isLoading ? 'Verifying...' : 'Confirm & Complete Registration'}
          </button>
        </form>
      </div>
    );
  }

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
