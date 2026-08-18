import React from 'react';
import { Activity, BarChart3, Gauge, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../charts/AnalyticsCharts';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

interface AnalyticsOverviewProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  title = 'Workforce Intelligence',
  subtitle = 'Live, scope-aware analytics from the workforce database',
  compact = false
}) => {
  const { data, isLoading, error, reload: load } = useAnalyticsData();

  const metricCards = [
    { label: 'Workforce', value: data?.metrics.totalWorkforce ?? '—', icon: Users, color: 'text-blue-400' },
    { label: 'Attendance', value: data?.metrics.attendanceRate ?? '—', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Performance', value: data?.metrics.averagePerformanceScore ?? '—', icon: Gauge, color: 'text-purple-400' },
    { label: 'Risk flags', value: data?.metrics.retentionRiskCount ?? '—', icon: Activity, color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--border-color)] bg-gradient-to-r from-blue-600/20 via-[var(--bg-secondary)] to-purple-600/20 p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300"><TrendingUp size={12} /> Scope-aware analytics</div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 px-4 py-3 text-right text-xs text-[var(--text-muted)]">
            <p className="font-bold text-[var(--text-primary)]">{data?.scope.role || 'Loading scope'}</p>
            <p>{data?.scope.team || data?.scope.department || 'Organization-wide'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 shadow-lg">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]"><span>{label}</span><Icon size={17} className={color} /></div>
            <p className="mt-3 text-2xl font-black text-[var(--text-primary)]">{isLoading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsLineChart title="Employee Growth & Hiring" subtitle="Headcount and new hires by join month" data={data?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#3b82f6' }, { key: 'hiring', name: 'New hires', color: '#06b6d4' }]} isLoading={isLoading} error={error} onRetry={load} />
        <AnalyticsBarChart title="Attendance Overview" subtitle="Present, absent and late attendance by weekday" data={data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }, { key: 'late', name: 'Late', color: '#f59e0b' }]} isLoading={isLoading} error={error} onRetry={load} />
        <AnalyticsBarChart title="Department Comparison" subtitle="Headcount and attendance performance by department" data={data?.departmentComparison} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#6366f1' }, { key: 'attendance', name: 'Attendance %', color: '#10b981' }]} layout="vertical" isLoading={isLoading} error={error} onRetry={load} />
        <AnalyticsDonutChart title="Department Distribution" subtitle="Current workforce allocation" data={data?.departmentDistribution} isLoading={isLoading} error={error} onRetry={load} />
        {!compact && <AnalyticsDonutChart title="Role Distribution" subtitle="Role mix in the authorized scope" data={data?.roleDistribution} isLoading={isLoading} error={error} onRetry={load} />}
        {!compact && <AnalyticsDonutChart title="Employment Status" subtitle="Active, remote, leave and offline workforce" data={data?.employmentStatus} isLoading={isLoading} error={error} onRetry={load} />}
        {!compact && <AnalyticsDonutChart title="Workforce Mode" subtitle="Office, remote and client attendance modes" data={data?.workforceDistribution} isLoading={isLoading} error={error} onRetry={load} />}
        <AnalyticsDonutChart title="Retention Risk" subtitle="Performance and attendance risk distribution" data={data?.riskDistribution} isLoading={isLoading} error={error} onRetry={load} colors={['#ef4444', '#f59e0b', '#10b981']} />
        {!compact && <AnalyticsBarChart title="Top Skills & Coverage" subtitle="Skills with strongest workforce coverage" data={data?.skillsAnalysis.topSkills} xKey="name" series={[{ key: 'coverage', name: 'Coverage %', color: '#06b6d4' }]} layout="vertical" isLoading={isLoading} error={error} onRetry={load} />}
        {!compact && <AnalyticsBarChart title="Skill Gaps" subtitle="Skills requiring development investment" data={data?.skillsAnalysis.missingSkills} xKey="name" series={[{ key: 'gap', name: 'Gap count', color: '#f97316' }]} layout="vertical" isLoading={isLoading} error={error} onRetry={load} />}
        <AnalyticsBarChart title="Team Productivity" subtitle="Average productivity score by team" data={data?.teamProductivity} xKey="name" series={[{ key: 'productivity', name: 'Productivity', color: '#8b5cf6' }]} layout="vertical" isLoading={isLoading} error={error} onRetry={load} />
        <AnalyticsLineChart title="Performance Trend" subtitle="KPI performance versus target" data={data?.performance} xKey="name" series={[{ key: 'performance', name: 'Performance', color: '#8b5cf6' }, { key: 'target', name: 'Target', color: '#f59e0b' }]} isLoading={isLoading} error={error} onRetry={load} />
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"><BarChart3 size={14} className="text-blue-400" /> Data is filtered by the authenticated role, organization, department, team and employee scope.</div>
    </div>
  );
};
