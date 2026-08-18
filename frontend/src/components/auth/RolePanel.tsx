import React from 'react';
import { RoleType } from '../../theme/roles';

interface RolePanelProps {
  role: RoleType;
}

const roleDetails = {
  ADMIN: {
    title: 'ADMIN',
    icon: '👑',
    headline: 'Organization Administration',
    description: 'Manage users, roles, permissions and workforce configuration with enterprise-grade controls.',
    bullets: [
      'User & membership management',
      'Granular roles & permission assignment',
      'Organization & company settings control',
      'Cross-department workforce analytics',
      'Comprehensive audit & security logs'
    ],
    gradient: 'from-[#7C3AED] to-[#A78BFA]',
    darkGradient: 'from-[#2E1065] to-[#5B21B6]'
  },
  HR: {
    title: 'HR MANAGER',
    icon: '👩‍💼',
    headline: 'Human Resources Management',
    description: 'Manage employees, attendance, workforce directories and HR operations seamlessly.',
    bullets: [
      'Central employee database & profiles',
      'Real-time attendance & check-in admin',
      'Company leave request approval flow',
      'HR metrics & compliance reports',
      'Organization-wide directory visibility'
    ],
    gradient: 'from-[#DB2777] to-[#F472B6]',
    darkGradient: 'from-[#500724] to-[#9D174D]'
  },
  MANAGER: {
    title: 'MANAGER',
    icon: '📊',
    headline: 'Team Performance & Strategy',
    description: 'Monitor team performance, department trends, and optimize overall group productivity.',
    bullets: [
      'Department-level analytics dashboard',
      'Performance evaluation & metrics tracking',
      'Department workload & schedule planning',
      'Team attendance summaries & sheets',
      'Direct reports list & status logs'
    ],
    gradient: 'from-[#2563EB] to-[#60A5FA]',
    darkGradient: 'from-[#172554] to-[#1D4ED8]'
  },
  TEAM_LEAD: {
    title: 'TEAM LEAD',
    icon: '🎯',
    headline: 'Team Leadership & Operations',
    description: 'Manage day-to-day team activities, track schedules, and support member collaboration.',
    bullets: [
      'Team check-in & status monitoring',
      'Live team presence tracking',
      'Member task assignment & management',
      'Daily attendance logs & reviews',
      'Team status updates & reports'
    ],
    gradient: 'from-[#059669] to-[#34D399]',
    darkGradient: 'from-[#022C22] to-[#047857]'
  },
  EMPLOYEE: {
    title: 'EMPLOYEE',
    icon: '👤',
    headline: 'Your Workforce Workspace',
    description: 'Manage your attendance, view schedules, request leaves, and track personal work hours.',
    bullets: [
      'Single-click check-in & check-out punches',
      'Flexible breaks & pauses management',
      'Interactive personal attendance history',
      'Self-service leave requests submission',
      'Personal dashboard & productivity insights'
    ],
    gradient: 'from-[#D97706] to-[#FBBF24]',
    darkGradient: 'from-[#451A03] to-[#B45309]'
  }
};

export const RolePanel: React.FC<RolePanelProps> = ({ role }) => {
  const details = roleDetails[role] || roleDetails.EMPLOYEE;

  return (
    <div className="h-full flex flex-col justify-between text-white p-8 relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-slate-900 -z-25"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_50%)] -z-20"></div>
      
      {/* Subtle abstract geometric lines */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/5 -z-10 animate-[spin_120s_linear_infinite]"></div>
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/5 -z-10 animate-[spin_180s_linear_infinite]"></div>

      {/* Top Banner indicating system */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
        <span>Enterprise Portal</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
      </div>

      {/* Center content */}
      <div className="my-auto space-y-6 max-w-md">
        {/* Dynamic icon & badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner transition-transform duration-500 hover:rotate-12">
            {details.icon}
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-white/15 backdrop-blur-md border border-white/10">
            {details.title}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white transition-all duration-300">
            {details.headline}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed font-light">
            {details.description}
          </p>
        </div>

        {/* Dynamic bullet items */}
        <ul className="space-y-2.5 pt-4">
          {details.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-white/90">
              <svg
                className="w-5 h-5 text-[var(--role-secondary,#34D399)] shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom status message */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
        <span>WorkSphere v1.2.0</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secure Connection Verified
        </span>
      </div>
    </div>
  );
};

export default RolePanel;
