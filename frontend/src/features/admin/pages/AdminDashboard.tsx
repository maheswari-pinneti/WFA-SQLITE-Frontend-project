import React, { useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { AdvancedFilterBar } from '../../../shared/components/AdvancedFilterBar';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';

import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';

// 6 Distinct Recharts Modules (Each uses a completely different chart type)
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

import {
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Award,
  Calendar,
  Gift,
  PartyPopper,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingDown,
  Briefcase,
  ShieldCheck,
  DollarSign,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Stackly Enterprise Analytics',
      details,
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Maheswari';

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.SYSTEM_CONFIG}>
      <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        
        {/* TailAdmin Hero Greeting Banner */}
        <div className="dashboard-hero p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 text-white border border-blue-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div style={{ display: 'inline-flex', width: 'fit-content' }} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-md border border-white/20">
              <Calendar size={14} className="text-blue-300" /> {currentDateFormatted}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h2>
            <p className="text-xs text-blue-100 font-medium">
              Department: <span className="font-bold text-white">{user?.department || 'Executive Governance'}</span> • Role: <span className="font-bold text-amber-300">System Administrator</span>
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <Link to="/admin/employees" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
              <UserPlus size={16} /> Add Employee
            </Link>
            <Link to="/admin/attendance-overview" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2">
              <Clock size={16} /> View Attendance
            </Link>
            <Link to="/admin/reports" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2">
              <FileSpreadsheet size={16} /> Generate Report
            </Link>
          </div>
        </div>

        {/* Global Filter Bar */}
        <AdvancedFilterBar />

        {/* EXECUTIVE WORKFORCE KPI METRICS (EXACTLY 8 CARDS - 4 COLS X 2 ROWS) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              EXECUTIVE WORKFORCE KPI METRICS (8 KEY INDICATORS)
            </h3>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              LIVE METRICS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <MinimalKpiCard
              title="Total Headcount"
              value="15,420"
              icon={<Users size={26} />}
              iconBgColor="emerald"
              trend="+12.4% than last month"
              trendType="positive"
              onClick={() => openDrillDown('Total Employee Headcount', '15,420 Active Records', 'Global workforce roster', [
                { label: 'Full-time Permanent', value: 13850 },
                { label: 'Contractors & Consultants', value: 1570 },
              ])}
            />

            {/* KPI 2 */}
            <MinimalKpiCard
              title="Active Duty Rate"
              value="14,850"
              icon={<ShieldCheck size={26} />}
              iconBgColor="blue"
              trend="+96.3% active shift"
              trendType="positive"
              onClick={() => openDrillDown('Active Duty Status', '14,850 Clocked In', 'Real-time shift roster', [
                { label: 'In-Office Campuses', value: 11200 },
                { label: 'Remote WFH', value: 3650 },
              ])}
            />

            {/* KPI 3 */}
            <MinimalKpiCard
              title="Attendance Rate"
              value="96.5%"
              icon={<Clock size={26} />}
              iconBgColor="amber"
              trend="+1.5% compliance"
              trendType="positive"
              onClick={() => openDrillDown('Attendance Compliance Rate', '96.5%', 'Weekly shift adherence', [
                { label: 'On-Time Clock Ins', value: '94.2%' },
                { label: 'Approved Remote WFH', value: '2.3%' },
              ])}
            />

            {/* KPI 4 */}
            <MinimalKpiCard
              title="Annual Attrition"
              value="4.2%"
              icon={<TrendingDown size={26} />}
              iconBgColor="rose"
              trend="-0.8% than last year"
              trendType="positive"
              onClick={() => openDrillDown('Employee Turnover Attrition', '4.2% Rate', 'Annual attrition index', [
                { label: 'Voluntary Resignations', value: '3.1%' },
                { label: 'Involuntary Departures', value: '1.1%' },
              ])}
            />

            {/* KPI 5 */}
            <MinimalKpiCard
              title="Monthly Payroll"
              value="$4.8M"
              icon={<DollarSign size={26} />}
              iconBgColor="purple"
              trend="+4.35% budget allocation"
              trendType="positive"
              onClick={() => openDrillDown('Monthly Enterprise Payroll', '$4.8M Total Budget', 'Monthly compensation', [
                { label: 'Base Salaries', value: '$4.1M' },
                { label: 'Bonuses & Perks', value: '$700K' },
              ])}
            />

            {/* KPI 6 */}
            <MinimalKpiCard
              title="Productivity Score"
              value="94.8%"
              icon={<Award size={26} />}
              iconBgColor="cyan"
              trend="+3.2% performance"
              trendType="positive"
              onClick={() => openDrillDown('Performance Score Index', '87% Average', 'Quarterly KPI score', [
                { label: 'Exceeding Expectations', value: '58%' },
                { label: 'Meeting Targets', value: '38%' },
              ])}
            />

            {/* KPI 7 */}
            <MinimalKpiCard
              title="Open Vacancies"
              value="124"
              icon={<Briefcase size={26} />}
              iconBgColor="indigo"
              trend="+8.4% open requisitions"
              trendType="positive"
              onClick={() => openDrillDown('Active Job Requisitions', '124 Roles', 'Hiring pipeline', [
                { label: 'Engineering Roles', value: 64 },
                { label: 'Sales & Growth', value: 32 },
              ])}
            />

            {/* KPI 8 */}
            <MinimalKpiCard
              title="Audit Compliance"
              value="99.8%"
              icon={<Layers size={26} />}
              iconBgColor="teal"
              trend="100% Zero-Trust Pass"
              trendType="positive"
              onClick={() => openDrillDown('Security & Audit Score', '99.8% Pass Rate', 'Automated security compliance', [
                { label: 'Zero Trust ABAC Policy', value: '100% Compliant' },
                { label: 'DBAC Scope Isolation', value: '100% Passed' },
              ])}
            />
          </div>
        </div>

        <AnalyticsOverview title="Executive Workforce Intelligence" subtitle="Organization-wide workforce, attendance, skills, productivity and risk analytics" />

        {/* Recent Enterprise Activity Stream & Celebrations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Recent Enterprise Activity
              </h3>
              <Link to="/audit-logs" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                Audit Stream <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { title: 'New employee joined Engineering team', time: '10m ago', user: 'Alex Mercer', badge: 'Onboarding', color: 'text-emerald-400 bg-emerald-500/10' },
                { title: 'Attendance marked for 14,850 employees', time: '1h ago', user: 'System Automated', badge: 'Attendance', color: 'text-blue-400 bg-blue-500/10' },
                { title: 'Leave request approved for Sarah Connor', time: '2h ago', user: 'Elena Rostova (HR)', badge: 'Approval', color: 'text-purple-400 bg-purple-500/10' },
                { title: 'Quarterly Performance KPI scores updated', time: '3h ago', user: 'David Sterling', badge: 'Performance', color: 'text-amber-400 bg-amber-500/10' },
              ].map((act, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{act.title}</p>
                      <p className="text-[10px] text-slate-400">By {act.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.color}`}>{act.badge}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" /> Upcoming Celebrations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                <Gift size={20} className="text-purple-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Sarah Connor's Birthday</p>
                  <p className="text-[10px] text-slate-400">Tomorrow • Product Team</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <PartyPopper size={20} className="text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">David Sterling's 5th Work Anniversary</p>
                  <p className="text-[10px] text-slate-400">Friday • Engineering Dept</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drill Down Modal */}
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </div>
    </RoleGuard>
  );
};
