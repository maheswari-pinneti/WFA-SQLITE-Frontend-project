import React, { useState } from 'react';
import { X, Layers, Download, FileText, Filter, ShieldCheck, Building2, UserCheck, Search, CheckSquare, Square } from 'lucide-react';

export interface DrillDownRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  metric: string;
  status: string;
}

export interface DrillDownData {
  title: string;
  metricValue: string | number;
  subtitle?: string;
  category?: string;
  details: { label: string; value: string | number; status?: string }[];
  records?: DrillDownRecord[];
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrillDownData | null;
}

const DEFAULT_RECORDS: DrillDownRecord[] = [
  { id: 'EMP-1001', name: 'Alex Mercer', role: 'System Admin', department: 'Engineering', metric: '98.5% Availability', status: 'ACTIVE' },
  { id: 'EMP-1002', name: 'Elena Rostova', role: 'HR Manager', department: 'Human Resources', metric: '100% Onboarded', status: 'VERIFIED' },
  { id: 'EMP-1003', name: 'David Sterling', role: 'Dept Manager', department: 'Product Operations', metric: '94.2% Goal Completion', status: 'ACTIVE' },
  { id: 'EMP-1004', name: 'Marcus Vance', role: 'Team Lead', department: 'Engineering', metric: '96.0% Velocity', status: 'COMPLETED' },
  { id: 'EMP-1005', name: 'Sophia Chen', role: 'Senior Engineer', department: 'Engineering', metric: '99.1% Code Quality', status: 'ACTIVE' },
  { id: 'EMP-1006', name: 'James Wilson', role: 'HR Specialist', department: 'Human Resources', metric: '92.4% SLA Score', status: 'VERIFIED' },
  { id: 'EMP-1007', name: 'Rachel Green', role: 'Financial Analyst', department: 'Finance & Legal', metric: '100% Budget Audit', status: 'ACTIVE' },
  { id: 'EMP-1008', name: 'Michael Scott', role: 'Sales Lead', department: 'Sales & Marketing', metric: '105% Target Met', status: 'ACTIVE' },
];

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, data }) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());

  if (!isOpen || !data) return null;

  const recordsList = data.records || DEFAULT_RECORDS;

  const filteredRecords = recordsList.filter((r) => {
    const matchesDept = selectedDept === 'ALL' || r.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || r.role.toLowerCase().includes(selectedRole.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || r.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleBadgeColor = (roleStr: string) => {
    const r = roleStr.toLowerCase();
    if (r.includes('admin')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (r.includes('hr')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (r.includes('manager') || r.includes('head')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (r.includes('lead')) return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  };

  const handleSelectRecord = (id: string) => {
    const newSelected = new Set(selectedRecordIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecordIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecordIds.size === filteredRecords.length) {
      setSelectedRecordIds(new Set());
    } else {
      setSelectedRecordIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedRecords = filteredRecords.filter((r) => selectedRecordIds.has(r.id));
    alert(`Exporting ${selectedRecords.length} records: \n` + JSON.stringify(selectedRecords, null, 2));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl glass-panel bg-slate-900 border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 cursor-default"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers size={20} />
            </div>
            <div>
              <span className="badge badge-info text-[9px] uppercase tracking-wider mb-0.5">
                {data.category || 'Metric Drill-Down Analysis'}
              </span>
              <h3 className="text-xl font-bold text-slate-100">{data.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main KPI Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aggregated Metric Total</p>
              <p className="text-3xl font-black text-white mt-1">{data.metricValue}</p>
              {data.subtitle && <p className="text-xs text-slate-300 mt-1">{data.subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 cursor-pointer"
              >
                Close Modal
              </button>
              <button className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md cursor-pointer">
                <Download size={14} /> Export All
              </button>
            </div>
          </div>

          {/* Metric Sub-Breakdown Details */}
          {data.details && data.details.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter size={14} className="text-blue-400" /> Sub-Metric Breakdown Components
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.details.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                    <p className="text-[11px] text-slate-400">{d.label}</p>
                    <p className="text-lg font-bold text-slate-100">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roles & Departments Interactive Filter Controls */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
                <FileText size={14} className="text-purple-400" /> Granular Record Drill-Down List ({filteredRecords.length})
              </h4>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter name, role, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full !bg-slate-950 !border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:!border-blue-500"
                />
              </div>
            </div>

            {/* Filter Dropdowns for Roles, Departments, and Statuses */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Building2 size={13} className="text-blue-400" /> Department:
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full !bg-slate-950 !border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:!border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Product Operations">Product Operations</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <UserCheck size={13} className="text-purple-400" /> Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full !bg-slate-950 !border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:!border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="HR">HR Manager / Specialist</option>
                  <option value="Manager">Dept Manager</option>
                  <option value="Lead">Team Lead</option>
                  <option value="Engineer">Senior Engineer / Employee</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Filter size={13} className="text-emerald-400" /> Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full !bg-slate-950 !border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:!border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Multiselect Action Bar */}
          {selectedRecordIds.size > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between text-xs animate-slideIn">
              <div className="flex items-center gap-2 text-blue-300">
                <CheckSquare size={16} />
                <span className="font-bold">{selectedRecordIds.size} records selected</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportSelected}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1"
                >
                  <Download size={13} /> Export Selected
                </button>
                <button
                  onClick={() => setSelectedRecordIds(new Set())}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Granular Records Table with Checkbox Column */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-2.5 w-10">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-100">
                      {selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                        <CheckSquare size={16} className="text-blue-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Employee / User</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Metric Value</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => handleSelectRecord(r.id)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        selectedRecordIds.has(r.id) ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleSelectRecord(r.id)} className="text-slate-400 hover:text-slate-100">
                          {selectedRecordIds.has(r.id) ? (
                            <CheckSquare size={16} className="text-blue-500" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px]">{r.id}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-100">{r.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${getRoleBadgeColor(r.role)}`}>
                          {r.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 flex items-center gap-1.5">
                        <Building2 size={12} className="text-slate-500 shrink-0" />
                        <span>{r.department}</span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-blue-400">{r.metric}</td>
                      <td className="px-4 py-2.5">
                        <span className="badge badge-success text-[9px] uppercase font-bold">{r.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400 italic">
                      No matching records found for the selected filter components.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px]">
            <ShieldCheck size={14} className="text-emerald-400" /> ABAC & Data Scope Verified
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close Drill-Down
          </button>
        </div>

      </div>
    </div>
  );
};
