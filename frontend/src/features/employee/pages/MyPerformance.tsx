import React from 'react';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';
import { Star, Award, Target } from 'lucide-react';

export const MyPerformance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">My Performance Scorecard</h2>
        <p className="text-sm text-slate-400">Quarterly KPI achievements, feedback, and skill ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Overall Score</span>
            <Star size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black">92 / 100</div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">Top 10% in Department</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Sprint Delivery</span>
            <Target size={18} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black">98.4%</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Zero SLA breaches</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Peer Recognition</span>
            <Award size={18} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black">4 Kudos</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Q2 Excellence Awards</p>
        </div>
      </div>

      <AnalyticsOverview title="My Live Performance Analytics" subtitle="Personal performance trend, productivity and workforce skills" compact />
    </div>
  );
};
