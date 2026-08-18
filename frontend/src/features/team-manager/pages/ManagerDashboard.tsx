import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';
import { workforceApi } from '../../../api/endpoints/workforce.api';

import { Briefcase, Users, CheckCircle2, XCircle, Clock, Zap, Star, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [approvals, setApprovals] = useState<Array<{ id: string; employee: string; type: string; duration: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>>([]);

  const loadApprovals = async () => {
    const requests = await workforceApi.getLeaveRequests();
    setApprovals(requests.map((request) => ({
      id: request.id,
      employee: request.employeeName,
      type: request.type,
      duration: `${request.startDate} - ${request.endDate}`,
      reason: request.reason,
      status: request.status
    })));
  };

  useEffect(() => { void loadApprovals().catch(() => setApprovals([])); }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await workforceApi.reviewLeaveRequest(id, status);
      await loadApprovals();
    } catch {
      // The API remains the source of truth; the next load keeps the desk consistent.
    }
  };

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Department Manager Scope',
      details,
    });
  };

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]} requiredPermission={Permission.TEAM_ANALYTICS_VIEW}>
      <div className="space-y-6 animate-fadeIn">
        {/* Manager Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Briefcase size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Department Manager Workspace</h2>
                <span className="badge badge-manager">ENGINEERING SCOPE</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Resource allocation, sub-team sprint velocity, leave approvals & department throughput.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/manager/approvals" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
              <CheckCircle2 size={14} /> Leave Approvals
            </Link>
            <Link to="/manager/analytics" className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Zap size={14} /> Team Analytics
            </Link>
          </div>
        </div>

        <AnalyticsOverview title="Department Intelligence" subtitle="Real-time analytics limited to your authenticated department scope" compact />

        {/* 8 Reusable Manager KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Department Staff"
            value="24 Engineers"
            change={8.3}
            trend="up"
            subtitle="3 Active squads"
            icon={<Users size={20} />}
            accentColor="blue"
            onClick={() => openDrillDown('Department Roster Breakdown', '24 Engineers', 'Frontend, Backend, and QA sub-teams', [
              { label: 'Frontend Core Squad', value: 8 },
              { label: 'Backend API Squad', value: 10 },
              { label: 'QA Automation Squad', value: 6 },
            ])}
          />
          <KPICard
            title="Department Velocity"
            value="94.2 / 100"
            change={4.1}
            trend="up"
            subtitle="+4.1% over Q2 target"
            icon={<Zap size={20} />}
            accentColor="purple"
            onClick={() => openDrillDown('Department Sprint Velocity', '94.2 Score', 'Sprint story points delivered vs planned', [
              { label: 'Frontend Throughput', value: '96.5%' },
              { label: 'Backend Throughput', value: '92.8%' },
            ])}
          />
          <KPICard
            title="Pending Approvals"
            value={`${approvals.filter(a => a.status === 'PENDING').length} Requests`}
            change={-1.0}
            trend="down"
            subtitle="Action required"
            icon={<Clock size={20} />}
            accentColor="amber"
            onClick={() => openDrillDown('Pending Department Approvals', `${approvals.filter(a => a.status === 'PENDING').length} Pending`, 'Team leave and expense queue', [
              { label: 'Alex Mercer Leave', value: '3 Days' },
              { label: 'Samantha Expense', value: '$450' },
            ])}
          />
          <KPICard
            title="Team Morale"
            value="4.8 / 5.0"
            change={0.4}
            trend="up"
            subtitle="Q2 review score"
            icon={<Star size={20} />}
            accentColor="emerald"
            onClick={() => openDrillDown('Department Team Morale', '4.8 / 5.0 Rating', 'Monthly squad pulse survey rating', [
              { label: 'Work-Life Balance', value: '4.9 / 5.0' },
              { label: 'Peer Collaboration', value: '4.8 / 5.0' },
            ])}
          />
          <KPICard
            title="Attendance Compliance"
            value="98.2%"
            change={1.2}
            trend="up"
            subtitle="Shift presence"
            icon={<CheckCircle2 size={20} />}
            accentColor="cyan"
            onClick={() => openDrillDown('Shift Attendance Compliance', '98.2%', 'Department daily attendance rate', [
              { label: 'On-Duty Office', value: 18 },
              { label: 'Remote Duty', value: 5 },
            ])}
          />
          <KPICard
            title="Completed Deliverables"
            value="42 Tasks"
            change={12.0}
            trend="up"
            subtitle="Sprint 24B target"
            icon={<FileText size={20} />}
            accentColor="emerald"
            onClick={() => openDrillDown('Completed Sprint Deliverables', '42 Tasks', 'Shipped feature modules and bug fixes', [
              { label: 'Feature Epics', value: 14 },
              { label: 'Bug Fixes', value: 22 },
            ])}
          />
          <KPICard
            title="Team Budget Health"
            value="82.4%"
            change={-2.1}
            trend="neutral"
            subtitle="Q2 Budget health"
            icon={<Briefcase size={20} />}
            accentColor="purple"
            onClick={() => openDrillDown('Department Budget Utilization', '82.4%', 'Quarterly software & infrastructure spend', [
              { label: 'Cloud Servers', value: '$12,400' },
              { label: 'SaaS Licensing', value: '$4,200' },
            ])}
          />
          <KPICard
            title="Retention Index"
            value="100% Stability"
            change={0.0}
            trend="neutral"
            subtitle="Zero department churn"
            icon={<AlertTriangle size={20} />}
            accentColor="rose"
            onClick={() => openDrillDown('Department Retention Index', '100% Retention', 'Predictive retention rating for department', [
              { label: 'Retention Rate', value: '100%' },
              { label: 'Turnover Risk', value: 'Low' },
            ])}
          />
        </div>

        {/* Section 1: Interactive Approval Action Desk */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock size={18} className="text-amber-400" /> Pending Team Leave & Request Approvals Desk
            </h3>
            <Link to="/manager/approvals" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
              Approvals Desk <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvals.length === 0 ? <p className="text-sm text-[var(--text-muted)] md:col-span-3">No leave requests are waiting in your department.</p> : approvals.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{req.employee}</span>
                  <span className="badge badge-info text-[9px] uppercase font-bold">{req.type}</span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-blue-400">{req.duration}</span> — {req.reason}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => void handleAction(req.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => void handleAction(req.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'} text-xs font-bold uppercase`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drill-Down Modal */}
        <DrillDownModal
          isOpen={drillDownData !== null}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
        />
      </div>
    </RoleGuard>
  );
};
