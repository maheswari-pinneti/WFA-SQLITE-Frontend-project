import React from 'react';

interface StacklyLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  useImg?: boolean;
  textColor?: string;
}

export const StacklyLogo: React.FC<StacklyLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
  useImg = true,
  textColor = 'text-slate-800 dark:text-white',
}) => {
  return (
    <div className={`inline-flex items-center shrink-0 gap-2.5 transition-all duration-300 ${className}`}>
      {useImg ? (
        <img
          src="/assets/images/logo.png"
          alt="Stackly Logo"
          style={{ height: size, width: 'auto' }}
          className="shrink-0 object-contain"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 filter drop-shadow-[0_2px_8px_rgba(45,212,191,0.25)]"
        >
        <defs>
          <linearGradient id="stackly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M75 25 C60 10, 40 10, 30 25 C20 40, 25 55, 40 60 C55 65, 60 75, 55 85 C50 95, 30 95, 20 80 C18 77, 21 75, 23 77 C30 85, 45 88, 48 80 C51 72, 45 62, 35 55 C20 45, 12 30, 25 15 C38 0, 62 2, 72 15 C75 18, 77 22, 75 25 Z"
          fill="url(#stackly-grad)"
        />
        <path
          d="M80 20 C70 35, 55 38, 45 45 C35 52, 32 62, 35 70 C38 78, 45 82, 55 80 C65 78, 70 70, 68 62 C66 54, 58 48, 52 45 C46 42, 44 38, 46 34 C48 30, 55 28, 62 30 C69 32, 72 38, 74 42 C75 44, 78 43, 77 40 C75 32, 68 24, 60 22 C52 20, 42 22, 38 28 C34 34, 35 42, 40 48 C45 54, 52 58, 56 62 C60 66, 62 70, 60 74 C58 78, 52 80, 48 78 C44 76, 42 72, 43 68 C44 64, 48 60, 52 58 C56 56, 60 52, 62 48 C64 44, 62 40, 60 38 C58 36, 55 35, 52 36 C49 37, 47 39, 48 42 C49 45, 52 46, 50 48 C48 50, 44 48, 42 46 C40 44, 40 40, 42 36 C44 32, 48 30, 52 30"
          fill="url(#stackly-grad)"
          opacity="0.8"
        />
      </svg>
      )}

      {showText && (
        <span
          className={`font-sans font-black tracking-widest ${textColor}`}
          style={{ fontSize: `${size * 0.52}px`, lineHeight: 1 }}
        >
          STACKLY
        </span>
      )}
    </div>
  );
};
