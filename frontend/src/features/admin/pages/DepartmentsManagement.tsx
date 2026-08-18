import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Building2, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const DepartmentsManagement: React.FC = () => {
  const [departments] = useState([
    { id: 'dept-1', name: 'Engineering & Technology', code: 'ENG', head: 'David Sterling', headcount: 142, budget: '$2,400,000' },
    { id: 'dept-2', name: 'Human Resources & Talent', code: 'HR', head: 'Elena Rostova', headcount: 28, budget: '$650,000' },
    { id: 'dept-3', name: 'Product & UX Design', code: 'DES', head: 'Sarah Connor', headcount: 45, budget: '$1,100,000' },
    { id: 'dept-4', name: 'Global Operations', code: 'OPS', head: 'Marcus Vance', headcount: 88, budget: '$1,850,000' },
    { id: 'dept-5', name: 'Enterprise Sales', code: 'SALES', head: 'Alex Mercer', headcount: 64, budget: '$1,500,000' },
  ]);

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Building2 className="text-purple-400" size={24} />
              Enterprise Department Management
            </h2>
            <p className="text-sm text-slate-400">
              Manage organizational hierarchy, cost center budgets, and department head assignments.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Add New Department
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 border-l-4 border-purple-500">
            <div className="text-xs font-semibold text-slate-400">Total Active Departments</div>
            <div className="text-2xl font-black mt-1">5 Business Units</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-blue-500">
            <div className="text-xs font-semibold text-slate-400">Total Assigned Headcount</div>
            <div className="text-2xl font-black mt-1">367 Employees</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Annual Budget Allocation</div>
            <div className="text-2xl font-black mt-1">$7,500,000</div>
          </div>
        </div>

        {/* Department List */}
        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Head</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Annual Budget</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <Building2 size={16} className="text-purple-400" />
                      {dept.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-indigo-400">{dept.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-300">{dept.head}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{dept.headcount} Staff</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{dept.budget}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm"><Edit3 size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-rose-400"><Trash2 size={14} /></Button>
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
