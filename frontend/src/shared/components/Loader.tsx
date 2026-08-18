import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading enterprise data...', size = 24 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 size={size} className="animate-spin text-blue-500" />
      <span className="text-xs font-semibold text-slate-400">{label}</span>
    </div>
  );
};
