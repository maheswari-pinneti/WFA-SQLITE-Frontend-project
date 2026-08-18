import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { AnalyticsDonutChart } from '../../../components/charts/AnalyticsCharts';
import { AlertTriangle, Users, HeartCrack, Activity } from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useEmployees } from '../../../hooks/useEmployees';

export const RiskAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { employees, isLoading: employeesLoading } = useEmployees({ pageSize: 150 });

  if (analyticsLoading || employeesLoading) {
    return <div className="text-sm text-[var(--text-muted)] p-6">Loading risk analytics...</div>;
  }

  const riskDistribution = analytics?.riskDistribution || [];
  const highRiskCount = riskDistribution.find(r => r.name === 'High Risk')?.value || 0;
  const mediumRiskCount = riskDistribution.find(r => r.name === 'Medium Risk')?.value || 0;
  const lowRiskCount = riskDistribution.find(r => r.name === 'Low Risk')?.value || 0;

  const riskRoster = (employees || [])
    .map(emp => {
      let riskFactor = 'Low';
      let rating = 3.0;
      let reason = 'Normal fatigue metrics';
      const performance = emp.performanceScore || 0;
      const attendance = emp.attendanceRate || 0;

      if (performance < 75 || attendance < 85) {
        riskFactor = 'High';
        rating = 8.5 + (100 - performance - attendance) / 40;
        reason = performance < 75 ? 'Low Performance Score' : 'Low Attendance Rate';
      } else if (performance < 85 || attendance < 95) {
        riskFactor = 'Medium';
        rating = 6.0 + (100 - performance - attendance) / 40;
        reason = 'Overtime fatigue & attendance drop';
      }

      return {
        name: emp.name,
        department: emp.department,
        riskFactor,
        reason,
        rating: Number(Math.min(10, rating).toFixed(1))
      };
    })
    .filter(emp => emp.riskFactor !== 'Low')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-danger mb-1">Retention Observatory</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Risk & Attrition Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Identify flight risk, burnout indicators, and fatigue alerts across departments.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="High Risk Staff" value={`${highRiskCount} Employees`} icon={<AlertTriangle size={26} />} iconBgColor="rose" trend="Action required" trendType="negative" />
          <MinimalKpiCard title="Medium Risk Staff" value={`${mediumRiskCount} Employees`} icon={<HeartCrack size={26} />} iconBgColor="amber" trend="Monitor closely" trendType={undefined} />
          <MinimalKpiCard title="Low Attrition Risk Staff" value={`${lowRiskCount} Employees`} icon={<Users size={26} />} iconBgColor="emerald" trend="Optimal workload limit" trendType="positive" />
          <MinimalKpiCard title="Overall Alert Level" value={highRiskCount > 5 ? 'High' : 'Low'} icon={<Activity size={26} />} iconBgColor="blue" trend="Based on active database" trendType="positive" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <AnalyticsDonutChart
            title="Retention Risk Distribution"
            subtitle="Overall employee headcount by risk category"
            data={riskDistribution}
            colors={['#ef4444', '#f59e0b', '#10b981']}
          />
        </div>

        {/* Risk Roster */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Retention Risk Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Risk Factor</th>
                  <th className="p-3">Burnout Reason</th>
                  <th className="p-3">Calculated Risk Rating</th>
                </tr>
              </thead>
              <tbody>
                {riskRoster.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400">No active risk flags detected in database.</td>
                  </tr>
                ) : riskRoster.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.name}</td>
                    <td className="p-3 text-slate-300">{item.department}</td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase ${item.riskFactor === 'High' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                        {item.riskFactor}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{item.reason}</td>
                    <td className="p-3 font-mono font-bold text-rose-400">{item.rating} / 10</td>
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
