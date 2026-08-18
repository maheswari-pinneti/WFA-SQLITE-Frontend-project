import React, { useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

import { UserCheck, Users, Briefcase, FileText, Plus, Clock, HeartHandshake, Star, AlertTriangle, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'HR Operations Lifecycle',
      details,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Elena';

  const candidatePipeline = [
    { name: 'Michael Faraday', role: 'Staff Frontend Engineer', stage: 'Technical Interview', status: 'SCHEDULED' },
    { name: 'Ada Lovelace', role: 'Principal Systems Architect', stage: 'Final Leadership Round', status: 'IN_REVIEW' },
    { name: 'Alan Turing', role: 'Senior AI Specialist', stage: 'Offer Stage', status: 'PENDING' },
    { name: 'Grace Hopper', role: 'DevOps Lead Engineer', stage: 'Initial Screening', status: 'COMPLETED' },
  ];

  // Map values dynamically from active database state if loaded
  const rawCount = analytics?.metrics?.totalWorkforce ?? 254;
  const headCount = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 254;
  const attendanceRate = analytics?.metrics?.attendanceRate ?? '96.5%';
  const riskCount = analytics?.metrics?.retentionRiskCount ?? 0;
  const lateCount = analytics?.metrics?.lateArrivals ?? 0;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.EMPLOYEE_READ}>
      <div className="space-y-6 animate-fadeIn font-sans">
        {/* HR Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
              <UserCheck size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">{getGreeting()}, {firstName} 👋</h2>
                <span className="badge badge-hr">HR OPERATIONS PORTAL</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Workforce lifecycle, candidate recruitment, payroll analysis & employee attendance oversight.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/hr/employees" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
              <Plus size={14} /> Add Employee
            </Link>
            <Link to="/hr/recruitment" className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Briefcase size={14} /> Recruitment Desk
            </Link>
          </div>
        </div>

        <AnalyticsOverview title="HR Workforce Intelligence" subtitle="Organization-wide workforce lifecycle, attendance, skill coverage and retention analytics" />

        {/* 8 Reusable HR KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Headcount"
            value={isLoading ? '…' : `${headCount} Staff`}
            change={8.4}
            trend="up"
            subtitle="Global workforce"
            icon={<Users size={20} />}
            accentColor="purple"
            onClick={() => openDrillDown('Total Headcount Breakdown', `${headCount} Staff`, 'Full workforce employment contracts', [
              { label: 'Authorized Workforce', value: headCount },
              { label: 'Primary Contracts', value: Math.max(0, headCount - 12) },
              { label: 'External Associates', value: Math.min(12, headCount) },
            ])}
          />
          <KPICard
            title="Recruitment Pipeline"
            value="18 Active"
            change={4.2}
            trend="up"
            subtitle="3 Offers pending"
            icon={<Briefcase size={20} />}
            accentColor="blue"
            onClick={() => openDrillDown('Talent Acquisition Pipeline', '18 Active Candidates', 'Open requisitions and interview stages', [
              { label: 'Screening Stage', value: 6 },
              { label: 'Technical Rounds', value: 9 },
              { label: 'Offers Released', value: 3 },
            ])}
          />
          <KPICard
            title="Shift Attendance"
            value={isLoading ? '…' : attendanceRate}
            change={1.2}
            trend="up"
            subtitle="Current cycle rate"
            icon={<Clock size={20} />}
            accentColor="emerald"
            onClick={() => openDrillDown('Workforce Attendance Rate', attendanceRate, 'Overall shift presence & clock-in compliance', [
              { label: 'On-Time Clock Ins', value: attendanceRate },
              { label: 'Late Clock-in Flags', value: lateCount },
            ])}
          />
          <KPICard
            title="Leave Requests"
            value="14 Pending"
            change={-2.4}
            trend="down"
            subtitle="Requires HR review"
            icon={<FileText size={20} />}
            accentColor="amber"
            onClick={() => openDrillDown('Pending Leave & PTO Requests', '14 Pending', 'Employee vacation and medical leave queue', [
              { label: 'Vacation Leave', value: 8 },
              { label: 'Sick / Medical', value: 4 },
              { label: 'Parental Leave', value: 2 },
            ])}
          />
          <KPICard
            title="Payroll Budget"
            value="$4.82M / mo"
            change={2.0}
            trend="up"
            subtitle="Monthly salary cost"
            icon={<DollarSign size={20} />}
            accentColor="emerald"
            onClick={() => openDrillDown('Monthly Payroll Budget', '$4,820,000', 'Total compensation and benefits allocation', [
              { label: 'Base Salaries', value: '$3,950,000' },
              { label: 'Health Benefits', value: '$520,000' },
              { label: 'Bonuses & Incentives', value: '$350,000' },
            ])}
          />
          <KPICard
            title="eNPS Satisfaction"
            value="95.2 Score"
            change={3.0}
            trend="up"
            subtitle="Satisfaction benchmark"
            icon={<HeartHandshake size={20} />}
            accentColor="cyan"
            onClick={() => openDrillDown('Employee Engagement Score', '95.2 eNPS', 'Quarterly employee survey satisfaction', [
              { label: 'Promoters', value: '88%' },
              { label: 'Passives', value: '9%' },
              { label: 'Detractors', value: '3%' },
            ])}
          />
          <KPICard
            title="Performance Review"
            value="4.8 / 5.0"
            change={0.4}
            trend="up"
            subtitle="Q2 Review score"
            icon={<Star size={20} />}
            accentColor="amber"
            onClick={() => openDrillDown('Q2 Performance Evaluation', '4.8 / 5.0 Avg', 'Organization performance ratings', [
              { label: 'Exceeds Target', value: '42%' },
              { label: 'Meets Target', value: '54%' },
              { label: 'Needs Improvement', value: '4%' },
            ])}
          />
          <KPICard
            title="Attrition Risk"
            value={isLoading ? '…' : `${riskCount} Flags`}
            change={-0.8}
            trend="down"
            subtitle="High attrition risk"
            icon={<AlertTriangle size={20} />}
            accentColor="rose"
            onClick={() => openDrillDown('Workforce Attrition Risk', `${riskCount} Risk Flags`, 'Predictive attrition & turnover analysis', [
              { label: 'Critical High Risk Staff', value: riskCount },
              { label: 'Standard Attrition Probability', value: '1.2%' },
            ])}
          />
        </div>

        {/* Section 1: Candidate Pipeline & Retention Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Briefcase size={18} className="text-purple-400" /> Active Talent Acquisition Candidate Pipeline
              </h3>
              <Link to="/hr/recruitment" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                View Desk <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {candidatePipeline.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.role} • <span className="text-purple-400 font-semibold">{c.stage}</span></p>
                  </div>
                  <span className="badge badge-success text-[10px] uppercase font-bold">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Employee Table */}
        <EmployeeTable />

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

