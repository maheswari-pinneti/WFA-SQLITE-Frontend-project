import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../app/store';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { Employee } from '../../../shared/types/common.types';
import { formatDate } from '../../../shared/utils/helpers';
import { UserPlus, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { employeeApi } from '../../../api/endpoints/employee.api';

export const EmployeeManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Filters State (applied to query)
  const [filters, setFilters] = useState({
    department: 'ALL',
    designation: 'ALL',
    status: 'ALL',
    location: 'ALL',
    joiningYear: 'ALL'
  });

  // Temporary Filters State (bound to input elements before "Apply" is clicked)
  const [tempFilters, setTempFilters] = useState({
    department: 'ALL',
    designation: 'ALL',
    status: 'ALL',
    location: 'ALL',
    joiningYear: 'ALL'
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Default page size: 25

  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    totalItems: 0,
    totalPages: 1
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchPaginatedEmployees = async () => {
    setIsLoadingData(true);
    try {
      const res = await employeeApi.getEmployees({
        page,
        pageSize,
        search: search || undefined,
        department: filters.department || undefined,
        designation: filters.designation || undefined,
        status: filters.status || undefined,
        location: filters.location || undefined,
        joiningYear: filters.joiningYear || undefined,
        sortBy: 'employeeCode',
        sortOrder: 'ASC'
      });
      setEmployeesData(res.employees);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load paginated employees:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPaginatedEmployees();
  }, [page, pageSize, filters, search]);

  const handleStatusChange = async (id: string, status: Employee['status']) => {
    try {
      await employeeApi.updateEmployeeStatus(id, status);
      fetchPaginatedEmployees();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      department: 'ALL',
      designation: 'ALL',
      status: 'ALL',
      location: 'ALL',
      joiningYear: 'ALL'
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleClearAll = () => {
    setSearch('');
    handleResetFilters();
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee ID',
      cell: (emp: Employee) => {
        return (
          <span className="font-mono font-bold text-slate-300">
            {emp.employeeCode || emp.code || '—'}
          </span>
        );
      }
    },
    {
      header: 'Employee Name',
      cell: (emp: Employee) => (
        <span className="font-bold text-slate-100">{emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`}</span>
      ),
    },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Designation', accessorKey: 'designation' },
    {
      header: 'Employment Status',
      cell: (emp: Employee) => {
        const status = emp.employment_status || 'Active';
        const colorClass = status === 'Active' ? 'text-emerald-400' :
                           status === 'Inactive' ? 'text-slate-400' :
                           status === 'On Leave' ? 'text-amber-400' :
                                                   'text-rose-400';
        return (
          <span className={`font-semibold text-xs flex items-center gap-1.5 ${colorClass}`}>
            <span className="text-[10px]">●</span> {status}
          </span>
        );
      }
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Phone',
      cell: (emp: Employee) => emp.phone || '—'
    },
    {
      header: 'Location',
      cell: (emp: Employee) => emp.location || '—'
    },
    {
      header: 'Joining Date',
      cell: (emp: Employee) => formatDate(emp.joining_date || emp.joinDate || '2025-01-01'),
    },
    {
      header: 'Manager',
      cell: (emp: Employee) => emp.manager_name || '—'
    },
    {
      header: 'Attendance Status',
      cell: (emp: Employee) => {
        const att = emp.attendance_status || emp.status || 'Present';
        const colorClass = att.toUpperCase() === 'PRESENT' || att.toUpperCase() === 'REMOTE' ? 'text-emerald-400' :
                           att.toUpperCase() === 'LATE' ? 'text-amber-400' :
                                                          'text-rose-400';
        return (
          <span className={`font-semibold text-xs flex items-center gap-1.5 ${colorClass}`}>
            <span className="text-[10px]">●</span> {att}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-3 text-slate-400 cursor-pointer select-none">
          <span className="hover:text-slate-200 transition-colors" title="View details">👁</span>
          <span className="hover:text-slate-200 transition-colors text-lg" title="More options">⋮</span>
        </div>
      )
    }
  ];

  const departments = ['ALL', 'Engineering', 'Product Management', 'Sales & Marketing', 'Human Resources', 'Customer Success', 'Finance & Operations'];
  const designations = ['ALL', 'Senior Software Engineer', 'Product Manager', 'Account Executive', 'HR Operations Manager', 'Customer Success Director', 'Financial Analyst', 'Full Stack Developer', 'Specialist'];
  const statuses = ['ALL', 'ACTIVE', 'REMOTE', 'ON_LEAVE', 'OFFLINE'];
  const locations = ['ALL', 'Hyderabad', 'Visakhapatnam', 'Chennai', 'Bengaluru', 'Kochi'];
  const joiningYears = ['ALL', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.EMPLOYEE_MANAGE}>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Workforce Employee Directory</h2>
            <p className="text-sm text-slate-400">Complete workforce personnel roster and department assignments</p>
          </div>
          <Button icon={<UserPlus size={16} />}>Onboard Employee</Button>
        </div>

        {/* Dedicated Filter Toolbar Card */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees by name or ID (e.g. 0007)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Filter size={14} />
                Advanced Filters {showAdvanced ? '▲' : '▼'}
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X size={14} />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel */}
          {showAdvanced && (
            <div className="pt-4 border-t border-[var(--border-color)] space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Advanced Filters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Department filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Department</label>
                  <select
                    value={tempFilters.department}
                    onChange={(e) => setTempFilters({ ...tempFilters, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
                    ))}
                  </select>
                </div>

                {/* Designation filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Designation</label>
                  <select
                    value={tempFilters.designation}
                    onChange={(e) => setTempFilters({ ...tempFilters, designation: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                  >
                    {designations.map((d) => (
                      <option key={d} value={d}>{d === 'ALL' ? 'All Designations' : d}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Employment Status</label>
                  <select
                    value={tempFilters.status}
                    onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                    ))}
                  </select>
                </div>

                {/* Location filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Location</label>
                  <select
                    value={tempFilters.location}
                    onChange={(e) => setTempFilters({ ...tempFilters, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>{l === 'ALL' ? 'All Locations' : l}</option>
                    ))}
                  </select>
                </div>

                {/* Joining Year filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Joining Year</label>
                  <select
                    value={tempFilters.joiningYear}
                    onChange={(e) => setTempFilters({ ...tempFilters, joiningYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                  >
                    {joiningYears.map((y) => (
                      <option key={y} value={y}>{y === 'ALL' ? 'All Years' : y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Directory List Panel */}
        <div className="glass-panel p-6 space-y-4 w-full max-w-full overflow-hidden">
          {isLoadingData ? (
            <div className="p-8 text-center text-slate-400">Loading workforce directory...</div>
          ) : employeesData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-semibold text-sm">
              No employees found matching the selected filters.
            </div>
          ) : (
            <>
              <DataTable
                data={employeesData}
                columns={columns}
              />

              {/* Table Footer with Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)] text-xs text-slate-400">
                <span>
                  Showing <strong className="text-[var(--text-primary)]">{pagination.totalItems === 0 ? 0 : ((page - 1) * pageSize) + 1}</strong> to{' '}
                  <strong className="text-[var(--text-primary)]">{Math.min(page * pageSize, pagination.totalItems).toLocaleString()}</strong> of{' '}
                  <strong className="text-[var(--text-primary)]">{pagination.totalItems.toLocaleString()}</strong> employees
                </span>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-1.5 font-bold">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-opacity"
                      title="First Page"
                    >
                      <ChevronsLeft size={14} />
                    </button>

                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-opacity"
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="font-extrabold text-[var(--text-primary)] px-2">
                      Page {page} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                      disabled={page === pagination.totalPages}
                      className="p-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-opacity"
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => setPage(pagination.totalPages)}
                      disabled={page === pagination.totalPages}
                      className="p-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-opacity"
                      title="Last Page"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};
