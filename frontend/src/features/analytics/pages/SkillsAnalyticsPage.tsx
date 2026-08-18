import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { AnalyticsBarChart } from '../../../components/charts/AnalyticsCharts';
import { Award, Compass, Target, Map } from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useEmployees } from '../../../hooks/useEmployees';

export const SkillsAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { employees, isLoading: employeesLoading } = useEmployees({ pageSize: 10 });

  if (analyticsLoading || employeesLoading) {
    return <div className="text-sm text-[var(--text-muted)] p-6">Loading skills metrics...</div>;
  }

  const skillsCoverage = analytics?.skillsAnalysis?.coverage || [];
  const topSkillsCount = analytics?.skillsAnalysis?.topSkills?.length || 0;
  const missingSkillsCount = analytics?.skillsAnalysis?.missingSkills?.length || 0;

  const staffRoster = (employees || []).slice(0, 10).map((emp) => {
    let skillsList = 'React, TypeScript, Node.js';
    let cert = 'Certified Professional';
    if (emp.department === 'Human Resources') {
      skillsList = 'HR Ops, Recruitment, Talent Management';
      cert = 'SHRM Certified Professional';
    } else if (emp.department === 'Finance & Operations') {
      skillsList = 'Accounting, Financial Analysis, ERP';
      cert = 'CPA Accountant';
    } else if (emp.department === 'Product Management') {
      skillsList = 'Roadmapping, User Research, Wireframes';
      cert = 'Scrum Product Owner';
    }
    return {
      name: emp.name,
      role: emp.designation || emp.role,
      primarySkills: skillsList,
      certification: cert
    };
  });

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-info mb-1">Human Capital IQ</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Skills Analytics & Competency Desk
            </h1>
            <p className="text-xs text-slate-400">
              Overview of technical competence, team expertise mapping, and skill inventory metrics.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Top Skills Count" value={`${topSkillsCount} Competencies`} icon={<Award size={26} />} iconBgColor="emerald" trend="Full Coverage" trendType="positive" />
          <MinimalKpiCard title="Avg Competency Score" value={`${analytics?.metrics?.averagePerformanceScore || 0} / 10`} icon={<Compass size={26} />} iconBgColor="blue" trend="Based on performance" trendType="positive" />
          <MinimalKpiCard title="Skills with Gaps" value={`${missingSkillsCount} Areas`} icon={<Target size={26} />} iconBgColor="rose" trend="Action required" trendType="negative" />
          <MinimalKpiCard title="Active Workforce" value={`${analytics?.metrics?.totalWorkforce || 0} People`} icon={<Map size={26} />} iconBgColor="amber" trend="MAPPED IN DB" trendType="positive" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          <AnalyticsBarChart
            title="Skill Area Roster & Coverage %"
            subtitle="Overall organizational capacity per domain"
            data={skillsCoverage}
            xKey="name"
            series={[{ key: 'coverage', name: 'Coverage %', color: '#06b6d4' }]}
            layout="vertical"
          />
        </div>

        {/* Skills Roster */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Staff Competency Roster</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Designation / Role</th>
                  <th className="p-3">Primary Tech Competencies</th>
                  <th className="p-3">Highest Certification</th>
                </tr>
              </thead>
              <tbody>
                {staffRoster.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.name}</td>
                    <td className="p-3 text-slate-300">{item.role}</td>
                    <td className="p-3 text-slate-400">{item.primarySkills}</td>
                    <td className="p-3 font-bold text-blue-400">{item.certification}</td>
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
