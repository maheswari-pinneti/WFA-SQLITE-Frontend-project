import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Star, BarChart3, TrendingUp, Users } from 'lucide-react';

export const PerformanceOverviewPage: React.FC = () => {
  const ratingsDistribution = [
    { rating: 'Exceptional (9-10)', count: 28, percentage: '18%' },
    { rating: 'Strong (8-9)', count: 68, percentage: '45%' },
    { rating: 'Meets Standards (7-8)', count: 48, percentage: '32%' },
    { rating: 'Needs Improvement (<7)', count: 8, percentage: '5%' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Executive Performance Summary</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Performance Overview
            </h1>
            <p className="text-xs text-slate-400">
              High-level overview of corporate rating distributions and talent matrices.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Total Appraised Staff" value="152 Appraised" icon={<Users size={26} />} iconBgColor="blue" trend="100% headcount coverage" trendType="positive" />
          <MinimalKpiCard title="Top Talent Tier" value="28 Staff" icon={<Star size={26} />} iconBgColor="amber" trend="Rating: Exceptional (9-10)" trendType="positive" />
          <MinimalKpiCard title="Corporate Average" value="8.4 / 10" icon={<TrendingUp size={26} />} iconBgColor="emerald" trend="Optimal talent density" trendType="positive" />
          <MinimalKpiCard title="Growth Readiness" value="88.5%" icon={<BarChart3 size={26} />} iconBgColor="purple" trend="High leadership readiness" trendType="positive" />
        </div>

        {/* Talent Grid */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Talent Rating Distribution (9-Box Matrix Mock)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">High Potential Leaders</h4>
              <p className="text-xs text-slate-400">High Performance & High Potential (Star Performers)</p>
              <div className="text-2xl font-black text-emerald-400">12 Employees</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Core Contributors</h4>
              <p className="text-xs text-slate-400">Solid Performance & Moderate Potential</p>
              <div className="text-2xl font-black text-blue-400">68 Employees</div>
            </div>
          </div>
        </div>

        {/* Detailed Distribution */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Performance Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Rating Range</th>
                  <th className="p-3">Employee Count</th>
                  <th className="p-3">Percentage Share</th>
                </tr>
              </thead>
              <tbody>
                {ratingsDistribution.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.rating}</td>
                    <td className="p-3 text-slate-300 font-bold">{item.count} Staff</td>
                    <td className="p-3 text-slate-400 font-mono">{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
