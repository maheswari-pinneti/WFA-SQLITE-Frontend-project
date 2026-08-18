import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { Gauge, Target, Award, Users } from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useEmployees } from '../../../hooks/useEmployees';

export const PerformanceAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { employees, isLoading: employeesLoading } = useEmployees({ pageSize: 50 });

  if (analyticsLoading || employeesLoading) {
    return <div className="text-sm text-[var(--text-muted)] p-6">Loading performance analytics...</div>;
  }

  const performanceTrend = analytics?.performance || [];
  const avgPerf = analytics?.metrics?.averagePerformanceScore || 0;

  const performanceReviews = (employees || [])
    .slice(0, 10)
    .map((emp) => {
      const scoreNum = emp.performanceScore || 85;
      const score = `${(scoreNum / 10).toFixed(1)}/10`;
      
      let rating = 'Meets Standards';
      if (scoreNum >= 95) rating = 'Exceptional';
      else if (scoreNum >= 85) rating = 'Strong';
      else if (scoreNum < 75) rating = 'Needs Improvement';

      return {
        name: emp.name,
        role: emp.designation || emp.role,
        score,
        reviewStatus: 'Completed',
        rating
      };
    });

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-manager mb-1">Performance Intelligence</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Performance Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Correlate team performance metrics, target completion percentages, and review status.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Avg Performance" value={`${avgPerf}%`} icon={<Gauge size={26} />} iconBgColor="emerald" trend="Q3 Assessment" trendType="positive" />
          <MinimalKpiCard title="Targets Achieved" value="94.6%" icon={<Target size={26} />} iconBgColor="blue" trend="Based on active KPIs" trendType="positive" />
          <MinimalKpiCard title="Evaluated Employees" value={`${analytics?.metrics?.totalWorkforce || 0} Staff`} icon={<Award size={26} />} iconBgColor="purple" trend="100% mapped" trendType="positive" />
          <MinimalKpiCard title="Completed Reviews" value="100%" icon={<Users size={26} />} iconBgColor="amber" trend="All staff evaluated" trendType="positive" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <AnalyticsLineChart
            title="Performance Score Trend vs Target"
            subtitle="Calculated average performance versus target benchmarks"
            data={performanceTrend}
            xKey="name"
            series={[
              { key: 'performance', name: 'Performance', color: '#8b5cf6' },
              { key: 'target', name: 'Target', color: '#f59e0b' }
            ]}
          />
        </div>

        {/* Reviews */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Employee Performance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Review Score</th>
                  <th className="p-3">Review Status</th>
                  <th className="p-3">Performance Class</th>
                </tr>
              </thead>
              <tbody>
                {performanceReviews.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.name}</td>
                    <td className="p-3 text-slate-300">{item.role}</td>
                    <td className="p-3 font-bold text-indigo-400">{item.score}</td>
                    <td className="p-3 text-slate-400">{item.reviewStatus}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase ${item.rating === 'Exceptional' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : item.rating === 'Strong' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {item.rating}
                      </span>
                    </td>
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
