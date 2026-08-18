import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Map, ShieldCheck, Award, Users } from 'lucide-react';

export const SkillCoveragePage: React.FC = () => {
  const certifications = [
    { title: 'AWS Solutions Architect', authority: 'Amazon Web Services', activeHolders: 12, renewalRate: '100%' },
    { title: 'Google Professional Cloud Architect', authority: 'Google Cloud Platform', activeHolders: 8, renewalRate: '92%' },
    { title: 'Certified Kubernetes Administrator', authority: 'CNCF / Linux Foundation', activeHolders: 6, renewalRate: '100%' },
    { title: 'Certified Scrum Product Owner', authority: 'Scrum Alliance', activeHolders: 15, renewalRate: '95%' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Human Capital Auditing</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Skill Coverage & Certificates
            </h1>
            <p className="text-xs text-slate-400">
              Audit active professional certifications, compliance rates, and expert density inside teams.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Active Certifications" value="48 Certificates" icon={<Award size={26} />} iconBgColor="emerald" trend="Authorized holders" trendType="positive" />
          <MinimalKpiCard title="Compliance Rate" value="98.5%" icon={<ShieldCheck size={26} />} iconBgColor="blue" trend="Zero expired status" trendType="positive" />
          <MinimalKpiCard title="Staff Coverage" value="86 Employees" icon={<Users size={26} />} iconBgColor="purple" trend="+12 holders this Q" trendType="positive" />
          <MinimalKpiCard title="Certification Index" value="Stable" icon={<Map size={26} />} iconBgColor="amber" trend="Full audit alignment" trendType="positive" />
        </div>

        {/* Certificates List */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Active Professional Certifications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Certification Title</th>
                  <th className="p-3">Issuing Authority</th>
                  <th className="p-3">Active Holders</th>
                  <th className="p-3">Renewal Compliance</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((cert, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{cert.title}</td>
                    <td className="p-3 text-slate-300">{cert.authority}</td>
                    <td className="p-3 font-bold text-blue-400">{cert.activeHolders} Employees</td>
                    <td className="p-3 text-emerald-400 font-bold uppercase">{cert.renewalRate}</td>
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
