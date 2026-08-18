import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { Button } from '../../../shared/components/Button';
import { Shield, Key, Save, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [auditLogging, setAuditLogging] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.SYSTEM_CONFIG}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">System Infrastructure Settings</h2>
          <p className="text-sm text-slate-400">Configure global authentication controls and security policies</p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            Security settings persisted successfully!
          </div>
        )}

        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Shield size={16} className="text-indigo-400" />
                Enforce Multi-Factor Authentication (MFA)
              </h4>
              <p className="text-xs text-slate-400">Require TOTP authenticator app for Admin & HR roles</p>
            </div>
            <input
              type="checkbox"
              checked={mfaRequired}
              onChange={(e) => setMfaRequired(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Key size={16} className="text-cyan-400" />
                Session Inactivity Timeout (Minutes)
              </h4>
              <p className="text-xs text-slate-400">Automatically invalidate inactive JWT bearer sessions</p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold">Detailed Security Audit Logs</h4>
              <p className="text-xs text-slate-400">Log all API calls and RBAC permission checks</p>
            </div>
            <input
              type="checkbox"
              checked={auditLogging}
              onChange={(e) => setAuditLogging(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button icon={<Save size={16} />} onClick={handleSave}>
              Save Security Configuration
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
