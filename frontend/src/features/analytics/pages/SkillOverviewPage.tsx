import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Compass, Award, Tag, Activity } from 'lucide-react';

export const SkillOverviewPage: React.FC = () => {
  const skillCategories = [
    { category: 'Frontend Development', skillsCount: 14, expertCount: 48, status: 'Stable' },
    { category: 'Backend & APIs', skillsCount: 12, expertCount: 32, status: 'Stable' },
    { category: 'Cloud Infrastructure', skillsCount: 8, expertCount: 12, status: 'Gaps Found' },
    { category: 'Data Science & ML', skillsCount: 6, expertCount: 8, status: 'High Mismatch' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Human Capital Registry</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Skill Overview
            </h1>
            <p className="text-xs text-slate-400">
              High-level overview of skill groups, expert counts, and development indicators.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Skill Domains" value="4 Domains" icon={<Compass size={26} />} iconBgColor="blue" trend="Frontend, Backend, Cloud, Data" trendType="positive" />
          <MinimalKpiCard title="Active Competencies" value="40 Skills" icon={<Award size={26} />} iconBgColor="emerald" trend="100% mapped to projects" trendType="positive" />
          <MinimalKpiCard title="Total Experts" value="100 Staff" icon={<Tag size={26} />} iconBgColor="purple" trend="Certified professionals" trendType="positive" />
          <MinimalKpiCard title="Inventory Health" value="Satisfactory" icon={<Activity size={26} />} iconBgColor="amber" trend="Cloud & ML need resource" trendType={undefined} />
        </div>

        {/* Categories Table */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Corporate Competency Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Skill Domain / Category</th>
                  <th className="p-3">Unique Skills</th>
                  <th className="p-3">Total Expert Count</th>
                  <th className="p-3">Inventory Status</th>
                </tr>
              </thead>
              <tbody>
                {skillCategories.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.category}</td>
                    <td className="p-3 text-slate-300 font-bold">{item.skillsCount} Skills</td>
                    <td className="p-3 text-slate-400 font-bold">{item.expertCount} Experts</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${item.status === 'Stable' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : item.status === 'Gaps Found' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {item.status}
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
