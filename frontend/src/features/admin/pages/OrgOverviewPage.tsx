import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Building2, Globe, Users, Network } from 'lucide-react';

export const OrgOverviewPage: React.FC = () => {
  const corporateEntities = [
    { name: 'Stackly Global HQ', region: 'North America', status: 'Active', headcount: 1420 },
    { name: 'Stackly EMEA Ltd', region: 'Europe', status: 'Active', headcount: 850 },
    { name: 'Stackly APAC Corp', region: 'Asia-Pacific', status: 'Active', headcount: 620 }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Corporate Directory</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Organization Overview
            </h1>
            <p className="text-xs text-slate-400">
              Overview of global entities, locations, departments, and leadership reporting hierarchies.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Corporate Entities" value="3 Entities" icon={<Building2 size={26} />} iconBgColor="blue" trend="Active globally" trendType="positive" />
          <MinimalKpiCard title="Global Locations" value="12 Campuses" icon={<Globe size={26} />} iconBgColor="emerald" trend="4 hubs (SF, NY, LDN, TYO)" trendType="positive" />
          <MinimalKpiCard title="Active Departments" value="6 Core Depts" icon={<Network size={26} />} iconBgColor="purple" trend="100% structured" trendType="positive" />
          <MinimalKpiCard title="Total Roster Count" value="2,890 Staff" icon={<Users size={26} />} iconBgColor="amber" trend="+12% annual growth" trendType="positive" />
        </div>

        {/* Corporate Hierarchy */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Active Corporate Entities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Entity Legal Name</th>
                  <th className="p-3">Primary Region</th>
                  <th className="p-3">Operating Status</th>
                  <th className="p-3">Total Allocated Headcount</th>
                </tr>
              </thead>
              <tbody>
                {corporateEntities.map((entity, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{entity.name}</td>
                    <td className="p-3 text-slate-300">{entity.region}</td>
                    <td className="p-3 text-emerald-400 font-bold">{entity.status}</td>
                    <td className="p-3 font-mono font-bold text-blue-400">{entity.headcount} Employees</td>
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
