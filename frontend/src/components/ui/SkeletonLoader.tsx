import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'h-4 rounded w-3/4'
      : 'rounded-xl';

  return (
    <div className={`animate-pulse bg-slate-300 dark:bg-slate-800 ${variantClass} ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 w-full space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="rect" className="h-32 w-full" />
      <div className="flex gap-2 justify-between">
        <Skeleton variant="rect" className="h-8 w-1/4" />
        <Skeleton variant="rect" className="h-8 w-1/4" />
      </div>
    </div>
  );
};

export default Skeleton;
