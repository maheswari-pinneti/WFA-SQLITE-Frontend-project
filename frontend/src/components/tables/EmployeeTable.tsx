import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { fetchEmployeesThunk, updateEmployeeStatusThunk } from '../../features/hr/store/hrSlice';
import { Employee } from '../../shared/types/common.types';
import { getRoleBadgeClass, formatDate } from '../../shared/utils/helpers';
import { Search, ChevronLeft, ChevronRight, UserPlus, Filter, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';

export const EmployeeTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, isLoading } = useSelector((state: RootState) => state.hr);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const handleStatusChange = (id: string, status: Employee['status']) => {
    dispatch(updateEmployeeStatusThunk({ id, status }));
  };

  const { canAccessDepartment } = useDepartmentAccess();

  const filteredEmployees = employees.filter((emp) => {
    const deptId = (emp as any).departmentId || emp.department || '';
    const hasDbacAccess = canAccessDepartment(deptId) || canAccessDepartment(emp.department);

    if (!hasDbacAccess) return false;

    const code = emp.employeeCode || emp.code || '';
    const desig = emp.designation || '';
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      desig.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const sortedFilteredEmployees = useMemo(() => {
    if (!filteredEmployees) return [];
    return [...filteredEmployees].sort((a, b) => {
      const codeA = (a && (a.employeeCode || a.code)) || '';
      const codeB = (b && (b.employeeCode || b.code)) || '';
      
      const numA = Number(codeA.match(/(\d+)$/)?.[1] ?? 0);
      const numB = Number(codeB.match(/(\d+)$/)?.[1] ?? 0);
      
      return numA - numB;
    });
  }, [filteredEmployees]);

  const totalPages = Math.ceil(sortedFilteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = sortedFilteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  const departments = [
    'ALL',
    'Engineering',
    'Product Management',
    'Sales & Marketing',
    'Human Resources',
    'Customer Success',
    'Finance & Operations'
  ];

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Enterprise Workforce Directory</h3>
            <span className="badge badge-info">{employees.length.toLocaleString()} Total Records</span>
          </div>
          <p className="text-xs text-slate-400">Complete workforce directory with instant role controls & shift tracking</p>
        </div>
        <Button icon={<UserPlus size={16} />}>Onboard Employee</Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search 10,000 employees by name, code, email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] w-full sm:w-auto cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments (10,000)' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 text-xs font-bold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
            <tr>
              <th className="px-5 py-3">Employee Details</th>
              <th className="px-5 py-3">Department & Designation</th>
              <th className="px-5 py-3">Role Level</th>
              <th className="px-5 py-3">Shift Status</th>
              <th className="px-5 py-3">Performance Meter</th>
              <th className="px-5 py-3">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-semibold">Loading 10,000 employee workforce directory...</td>
              </tr>
            ) : paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No matching employee records found.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{emp.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{emp.employeeCode || emp.code || 'WFA-1000'} • {emp.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-[var(--text-primary)]">{emp.department}</p>
                    <p className="text-xs text-slate-400">{emp.designation || 'Specialist'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${getRoleBadgeClass(emp.role as any)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={emp.status}
                      onChange={(e) => handleStatusChange(emp.id, e.target.value as Employee['status'])}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer"
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="REMOTE">REMOTE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${emp.performanceScore || 90}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">{emp.performanceScore || 90}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 font-medium">
                    {formatDate(emp.joinDate || '2025-01-01')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Pagination Controls for 10,000 Records */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-400 pt-2">
          <span>
            Showing <strong className="text-[var(--text-primary)]">{((page - 1) * pageSize) + 1}</strong> to{' '}
            <strong className="text-[var(--text-primary)]">{Math.min(page * pageSize, filteredEmployees.length).toLocaleString()}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{filteredEmployees.length.toLocaleString()}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-extrabold text-[var(--text-primary)] px-3">
              Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-30"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
