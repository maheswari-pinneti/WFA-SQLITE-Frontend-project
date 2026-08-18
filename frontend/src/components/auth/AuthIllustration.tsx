import React from 'react';
import { RoleType } from '../../theme/roles';

interface AuthIllustrationProps {
  role: RoleType;
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({ role }) => {
  return (
    <div className="relative w-full aspect-video md:aspect-square flex items-center justify-center select-none max-w-sm mx-auto">
      {/* Decorative backdrop shapes */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[var(--role-primary)] to-[var(--role-secondary)] opacity-10 blur-2xl animate-[pulse_4s_ease-in-out_infinite]"></div>

      {/* SVG Analytics Interface Dashboard */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[280px] drop-shadow-2xl"
      >
        {/* Main Card Grid */}
        <rect x="20" y="50" width="360" height="300" rx="20" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
        
        {/* Glassmorphic overlay */}
        <rect x="20" y="50" width="360" height="80" rx="20" fill="rgba(255, 255, 255, 0.05)" />
        
        {/* Left window controls */}
        <circle cx="50" cy="90" r="6" fill="#EF4444" opacity="0.8" />
        <circle cx="70" cy="90" r="6" fill="#F59E0B" opacity="0.8" />
        <circle cx="90" cy="90" r="6" fill="#10B981" opacity="0.8" />

        {/* Dashboard Title line */}
        <line x1="130" y1="90" x2="250" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round" />

        {/* Dynamic bar charts */}
        <g strokeLinecap="round" strokeWidth="18" opacity="0.85">
          {/* Bar 1 */}
          <line x1="80" y1="280" x2="80" y2="180" stroke="var(--role-primary)" />
          {/* Bar 2 */}
          <line x1="130" y1="280" x2="130" y2="150" stroke="var(--role-secondary)" />
          {/* Bar 3 */}
          <line x1="180" y1="280" x2="180" y2="210" stroke="var(--role-primary)" />
          {/* Bar 4 */}
          <line x1="230" y1="280" x2="230" y2="130" stroke="var(--role-secondary)" />
          {/* Bar 5 */}
          <line x1="280" y1="280" x2="280" y2="160" stroke="var(--role-primary)" />
          {/* Bar 6 */}
          <line x1="330" y1="280" x2="330" y2="190" stroke="var(--role-secondary)" />
        </g>

        {/* Horizontal grid lines */}
        <line x1="50" y1="280" x2="350" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="50" y1="220" x2="350" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="50" y1="160" x2="350" y2="160" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    </div>
  );
};

export default AuthIllustration;
