import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const SsoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Verifying Single Sign-On credentials...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = sessionStorage.getItem('sso_provider') || 'google';

    if (!code || !state) {
      setError('Invalid redirect URL. Missing code or state parameters.');
      return;
    }

    const performCallback = async () => {
      try {
        const res = await authService.ssoCallback(code, state, provider);
        
        // If MFA verification or enrollment is required
        if (res && res.requiresMfa) {
          sessionStorage.setItem('mfa_challenge_id', res.challengeId);
          sessionStorage.setItem('mfa_expires_at', res.expiresAt);
          if (res.requiresMfaSetup) {
            sessionStorage.setItem('mfa_requires_setup', 'true');
            sessionStorage.setItem('mfa_setup_secret', res.secret);
            sessionStorage.setItem('mfa_setup_qr', res.qrCodeDataUrl);
            sessionStorage.setItem('mfa_setup_otpauth', res.otpauthUrl);
          } else {
            sessionStorage.setItem('mfa_requires_totp', 'true');
          }
          
          navigate('/login');
        } else {
          // Successful login (redirect to role-based dashboard)
          const stored = authService.getStoredSession();
          if (stored && stored.user) {
            const role = stored.user.role;
            if (role === 'ADMIN') {
              navigate('/admin/dashboard');
            } else if (role === 'HR') {
              navigate('/hr/dashboard');
            } else if (role === 'MANAGER') {
              navigate('/manager/dashboard');
            } else {
              navigate('/employee/dashboard');
            }
          } else {
            navigate('/');
          }
        }
      } catch (err: any) {
        setError(err.message || 'SSO authentication failed. Please try again.');
      }
    };

    performCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-cyan-500 border-b-slate-800 border-l-slate-800 rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-bold text-white tracking-wide">
          {error ? 'Authentication Error' : 'Single Sign-On'}
        </h2>
        
        {error ? (
          <div className="space-y-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">{status}</p>
        )}
      </div>
    </div>
  );
};
