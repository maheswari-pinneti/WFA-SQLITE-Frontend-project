import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { MapPin, ShieldCheck, Navigation, Activity } from 'lucide-react';

export const GeofencingPage: React.FC = () => {
  const geofencedLocations = [
    { name: 'MAHE HQ Office (Bangalore)', latitude: '12.9716', longitude: '77.5946', radius: '200m', compliance: '100% compliant' },
    { name: 'SF Technology Campus', latitude: '37.7749', longitude: '-122.4194', radius: '150m', compliance: '98.5% compliant' },
    { name: 'London Finance Hub', latitude: '51.5074', longitude: '-0.1278', radius: '100m', compliance: '100% compliant' }
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Geographic Security</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Geofencing Policy Desk
            </h1>
            <p className="text-xs text-slate-400">
              Manage office coordinates, radius thresholds, and geofenced attendance check-in parameters.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Active Fences" value="3 Locations" icon={<MapPin size={26} />} iconBgColor="blue" trend="Auto-synchronized" trendType="positive" />
          <MinimalKpiCard title="Avg Check-in Distance" value="24 meters" icon={<Navigation size={26} />} iconBgColor="emerald" trend="Within office limits" trendType="positive" />
          <MinimalKpiCard title="Geofence Compliance" value="99.2%" icon={<ShieldCheck size={26} />} iconBgColor="purple" trend="0 bypass logs" trendType="positive" />
          <MinimalKpiCard title="Failsafe Checks" value="100% Active" icon={<Activity size={26} />} iconBgColor="amber" trend="Auto-reporting enabled" trendType="positive" />
        </div>

        {/* Fences List */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Configured Office Geofences</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Office Location</th>
                  <th className="p-3">Latitude</th>
                  <th className="p-3">Longitude</th>
                  <th className="p-3">Geofence Radius</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {geofencedLocations.map((loc, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{loc.name}</td>
                    <td className="p-3 text-slate-300 font-mono">{loc.latitude}</td>
                    <td className="p-3 text-slate-300 font-mono">{loc.longitude}</td>
                    <td className="p-3 text-slate-400 font-bold">{loc.radius}</td>
                    <td className="p-3 text-emerald-400 font-bold uppercase">{loc.compliance}</td>
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
