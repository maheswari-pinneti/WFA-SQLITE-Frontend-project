import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { StacklyLogo } from '../components/common/StacklyLogo';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
      <div className="glass-panel p-8 max-w-md w-full text-center backdrop-blur-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-center pb-2">
          <StacklyLogo size={40} showText={true} />
        </div>

        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <ShieldAlert size={40} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono font-bold border border-rose-500/30">
            <Lock size={12} /> HTTP 403 Forbidden
          </div>
          <h1 className="text-2xl font-black text-white">Access Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            You don't have permission or clearance level to view this department or module.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-blue-500/25 transition-all no-underline"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
