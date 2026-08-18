import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAuth } from '../../../auth/hooks/useAuth';

// Attendance System Components
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';

import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';

import { Clock, Calendar, FileText, Compass, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data } = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Employee Self-Service Scope',
      details,
    });
  };

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]} requiredPermission={Permission.PROFILE_VIEW}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        
        {/* Employee Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
              alt={user?.name || "Employee"}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Welcome back, {user?.name || "Alex Mercer"}!</h2>
                <span className="badge badge-success">SELF SERVICE</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {user?.title || "Full Stack Developer"} • {user?.department || "Engineering & Technology Department (Frontend Team)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/employee/leave" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md">
              <FileText size={14} /> Request Time Off
            </Link>
            <Link to="/employee/profile" className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Compass size={14} /> My Profile
            </Link>
          </div>
        </div>

        <AnalyticsOverview title="My Workforce Intelligence" subtitle="Personal attendance, performance and skill coverage" compact />

        {/* LIVE CHECK-IN / CHECK-OUT WIDGET & TIME TRACKER */}
        <LiveCheckInWidget />



        {/* 4 Employee Attendance & Performance KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="My Shift Attendance"
            value="98.5%"
            change={1.5}
            trend="up"
            subtitle="Monthly compliance"
            icon={<Clock size={20} />}
            accentColor="emerald"
            onClick={() => openDrillDown('My Shift Attendance Log', '98.5%', 'Personal monthly shift clock-ins', [
              { label: 'Total Hours Worked', value: '176 Hours' },
              { label: 'On-Time Clock Ins', value: 21 },
            ])}
          />
          <KPICard
            title="Hours in Office"
            value="176 hrs"
            change={4.2}
            trend="up"
            subtitle="August 2026 accrued"
            icon={<Calendar size={20} />}
            accentColor="blue"
            onClick={() => openDrillDown('Office Hours Logged', '176 Hours', 'Monthly accrued office time', [
              { label: 'Average Daily Hours', value: '8.8 Hours/Day' },
              { label: 'Overtime Accrued', value: '12 Hours' },
            ])}
          />
          <KPICard
            title="Paid Time Off (PTO)"
            value="18 Days"
            change={0}
            trend="neutral"
            subtitle="Available leave balance"
            icon={<FileText size={20} />}
            accentColor="purple"
            onClick={() => openDrillDown('Leave Balance Breakdown', '18 Days', 'PTO & sick leave balance', [
              { label: 'Annual Paid Leave', value: '14 Days' },
              { label: 'Casual & Sick Leave', value: '4 Days' },
            ])}
          />
          <KPICard
            title="Monthly Payroll Net"
            value="$8,450"
            change={2.5}
            trend="up"
            subtitle="Estimated August payout"
            icon={<DollarSign size={20} />}
            accentColor="amber"
            onClick={() => openDrillDown('Monthly Salary Statement', '$8,450 Net', 'Payroll breakdown', [
              { label: 'Base Gross Salary', value: '$9,200' },
              { label: 'Deductions & Tax', value: '-$750' },
            ])}
          />
        </div>

        {/* INTERACTIVE MONTHLY ATTENDANCE CALENDAR VIEW */}
        <AttendanceCalendarView />

        {/* Drill Down Modal */}
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </div>
    </RoleGuard>
  );
};
