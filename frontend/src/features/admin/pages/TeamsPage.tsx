import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Users, User, Clock, ShieldCheck } from 'lucide-react';
import { useEmployees } from '../../../hooks/useEmployees';
import { Employee } from '../../../shared/types/common.types';

export const TeamsPage: React.FC = () => {
  const { employees, isLoading } = useEmployees({ pageSize: 250 });

  if (isLoading) {
    return <div className="text-sm text-[var(--text-muted)] p-6">Loading teams...</div>;
  }

  const teamsMap: Record<string, { name: string; lead: string; members: number; dept: string; status: string }> = {};
  
  (employees || []).forEach((emp: Employee) => {
    const teamName = emp.team || 'Unassigned';
    if (!teamsMap[teamName]) {
      teamsMap[teamName] = {
        name: teamName,
        lead: 'Unassigned',
        members: 0,
        dept: emp.department || 'Unassigned',
        status: 'Active'
      };
    }
    
    teamsMap[teamName].members += 1;
    
    if (emp.role === 'TEAM_LEAD' || emp.designation?.toLowerCase().includes('lead') || teamsMap[teamName].lead === 'Unassigned') {
      teamsMap[teamName].lead = emp.name;
    }
  });

  const teamsList = Object.values(teamsMap).filter(t => t.name !== 'Unassigned');
  const totalLeads = teamsList.filter(t => t.lead !== 'Unassigned').length;
  const avgTeamSize = teamsList.length ? (employees.length / teamsList.length).toFixed(1) : '0';

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-manager mb-1">Corporate Teams Directory</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Teams Management
            </h1>
            <p className="text-xs text-slate-400">
              Manage operational teams, team leadership assignments, and member allocation lists.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Active Teams" value={`${teamsList.length} Teams`} icon={<Users size={26} />} iconBgColor="blue" trend="100% structured" trendType="positive" />
          <MinimalKpiCard title="Assigned Leads" value={`${totalLeads} Leads`} icon={<User size={26} />} iconBgColor="emerald" trend="Zero missing leads" trendType="positive" />
          <MinimalKpiCard title="Average Team Size" value={`${avgTeamSize} members`} icon={<Clock size={26} />} iconBgColor="amber" trend="Optimal collaboration ratio" trendType="positive" />
          <MinimalKpiCard title="Operational Health" value="Stable" icon={<ShieldCheck size={26} />} iconBgColor="purple" trend="No structural blockers" trendType="positive" />
        </div>

        {/* Teams List */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Active Sub-Teams</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Team Name</th>
                  <th className="p-3">Team Leader</th>
                  <th className="p-3">Total Members</th>
                  <th className="p-3">Parent Department</th>
                  <th className="p-3">Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {teamsList.map((team, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{team.name}</td>
                    <td className="p-3 text-slate-300 font-medium">{team.lead}</td>
                    <td className="p-3 text-slate-400 font-bold">{team.members} Staff</td>
                    <td className="p-3 text-slate-400">{team.dept}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg border text-[10px] uppercase bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        {team.status}
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
