import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Target, ShieldAlert, Award, Compass } from 'lucide-react';

export const SkillGapsPage: React.FC = () => {
  const missingSkills = [
    { skill: 'AWS CloudFormation / IaC', team: 'DevOps & Infrastructure', gapCount: 6, priority: 'Critical' },
    { skill: 'PyTorch / ML Pipelines', team: 'Analytics Engine Group', gapCount: 4, priority: 'High' },
    { skill: 'React Native / Mobile UI', team: 'Consumer Mobile Roster', gapCount: 3, priority: 'Medium' },
    { skill: 'GraphQL / Federation', team: 'Core API Integration', gapCount: 2, priority: 'Low' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-danger mb-1">Capability Audit Desk</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Skill Gaps Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Audit skills mismatch, priority training needs, and headcount gaps across operational units.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Critical Gaps" value="6 Gaps" icon={<ShieldAlert size={26} />} iconBgColor="rose" trend="Action required" trendType="negative" />
          <MinimalKpiCard title="High Priority Gaps" value="4 Gaps" icon={<Target size={26} />} iconBgColor="amber" trend="Incorporate into training" trendType={undefined} />
          <MinimalKpiCard title="Upskilling Targets" value="15 Staff" icon={<Award size={26} />} iconBgColor="blue" trend="Active courses assigned" trendType="positive" />
          <MinimalKpiCard title="Competency Health" value="86%" icon={<Compass size={26} />} iconBgColor="emerald" trend="Optimal core density" trendType="positive" />
        </div>

        {/* Gaps List */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Targeted Skills Shortages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Required Skill</th>
                  <th className="p-3">Impacted Team</th>
                  <th className="p-3">Missing Headcount</th>
                  <th className="p-3">Remediation Priority</th>
                </tr>
              </thead>
              <tbody>
                {missingSkills.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.skill}</td>
                    <td className="p-3 text-slate-300">{item.team}</td>
                    <td className="p-3 font-bold text-rose-400">{item.gapCount} Staff</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${item.priority === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' : item.priority === 'High' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
                        {item.priority}
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
