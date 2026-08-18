import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Layers, ShieldCheck, Save, Server } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const SystemConfiguration: React.FC = () => {
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [rateLimit, setRateLimit] = useState('1000');

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Layers className="text-teal-400" size={24} />
              Enterprise System & Infrastructure Configuration
            </h2>
            <p className="text-sm text-slate-400">
              Manage core platform parameters, SSO providers, session limits, and security thresholds.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Save size={16} /> Save System Config
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security & Authentication */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="text-blue-400" size={18} />
              Authentication & Security Controls
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-bold text-sm text-slate-200">SAML 2.0 / OAuth2 SSO Integration</div>
                <div className="text-xs text-slate-400">Enable Okta, Azure AD, and Google Workspace SSO</div>
              </div>
              <input
                type="checkbox"
                checked={ssoEnabled}
                onChange={(e) => setSsoEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-800/60">
              <div>
                <div className="font-bold text-sm text-slate-200">Enforce Multi-Factor Authentication (MFA)</div>
                <div className="text-xs text-slate-400">Require TOTP for all Admin and HR roles</div>
              </div>
              <input
                type="checkbox"
                checked={mfaEnforced}
                onChange={(e) => setMfaEnforced(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-2 border-t border-slate-800/60">
              <label className="font-bold text-sm text-slate-200 block mb-1">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Infrastructure & API Thresholds */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="text-teal-400" size={18} />
              API Gateway & Infrastructure Throttling
            </h3>

            <div className="py-2">
              <label className="font-bold text-sm text-slate-200 block mb-1">Global API Rate Limit (Req/Min per IP)</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="py-2 border-t border-slate-800/60 space-y-2">
              <div className="font-bold text-sm text-slate-200">Database Connection Pool Status</div>
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span>Active Connections: <strong className="text-emerald-400">24 / 100</strong></span>
                <span>Latency: <strong className="text-cyan-400">1.4ms</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
