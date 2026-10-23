import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Users,
  Award,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { workforceApi } from '../services/api';
import { EmployeeDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface WorkforceAnalyticsProps {
  selectedWeek: string;
  selectedDept: string;
}

export const WorkforceAnalytics: React.FC<WorkforceAnalyticsProps> = ({
  selectedWeek,
  selectedDept
}) => {
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Table filters & search
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [sortField, setSortField] = useState<keyof EmployeeDetail>('productivity_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Selected for drawer
  const [inspectEmployee, setInspectEmployee] = useState<EmployeeDetail | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workforceApi.getEmployees({
        week_id: selectedWeek,
        department: selectedDept !== 'All Departments' ? selectedDept : undefined,
        limit: 200
      });
      setEmployees(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch workforce records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedWeek, selectedDept]);

  // Derived filter options
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.role))).sort();
  }, [employees]);

  // Filtered and sorted data
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
          emp.skills.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter === 'All Roles' || emp.role === roleFilter;
        const matchesStatus = statusFilter === 'All Statuses' || emp.status_category === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [employees, search, roleFilter, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage]);

  const handleSort = (field: keyof EmployeeDetail) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Aggregate by role for chart
  const roleChartData = useMemo(() => {
    const map: Record<string, { count: number; totalProd: number; totalLoad: number }> = {};
    employees.forEach((e) => {
      if (!map[e.role]) map[e.role] = { count: 0, totalProd: 0, totalLoad: 0 };
      map[e.role].count += 1;
      map[e.role].totalProd += e.productivity_score;
      map[e.role].totalLoad += e.workload_ratio;
    });

    return Object.entries(map).map(([role, stats]) => ({
      role: role.length > 20 ? role.substring(0, 18) + '...' : role,
      avg_productivity: Number((stats.totalProd / stats.count).toFixed(1)),
      avg_workload: Number(((stats.totalLoad / stats.count) * 100).toFixed(1)),
      headcount: stats.count
    }));
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Top Chart: Role-Level Productivity vs Headcount */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Level Productivity & Headcount Distribution</h3>
            <p className="text-xs text-slate-500">Benchmark across engineering archetypes for Sprint {selectedWeek}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-600"></span> Avg Productivity (0-100)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span> Workload % of Cap
            </span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="role" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 140]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="avg_productivity" name="Productivity Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_workload" name="Workload Ratio %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by engineer, ID or skill..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All Roles">All Roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All Statuses">All Workload Statuses</option>
            <option value="Balanced">Balanced</option>
            <option value="Overloaded">Overloaded</option>
            <option value="Burnout Risk">Burnout Risk</option>
            <option value="Underutilized">Underutilized</option>
          </select>

          <a
            href="/api/v1/reports/csv"
            download
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Employee Records Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Filtering workforce records..." />
        ) : error ? (
          <div className="p-6">
            <ErrorBanner message={error} onRetry={fetchEmployees} />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No employee records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Engineer <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Role & Practice</th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('productivity_score')}>
                    <div className="flex items-center justify-end gap-1">
                      Productivity <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('workload_ratio')}>
                    <div className="flex items-center justify-end gap-1">
                      Workload <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('logged_hours')}>
                    <div className="flex items-center justify-end gap-1">
                      Logged / Cap <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('overtime_hours')}>
                    <div className="flex items-center justify-end gap-1">
                      Overtime <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('backlog_tasks')}>
                    <div className="flex items-center justify-end gap-1">
                      Backlog <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('client_csat')}>
                    <div className="flex items-center justify-end gap-1">
                      CSAT <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEmployees.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    onClick={() => setInspectEmployee(emp)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.employee_id} • {emp.experience_years}y exp</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{emp.role}</div>
                      <div className="text-[10px] text-slate-500 max-w-[180px] truncate">{emp.department}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                        {emp.productivity_score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      <span className={emp.workload_ratio > 1.25 ? 'text-rose-600 font-bold' : emp.workload_ratio > 1.15 ? 'text-amber-600' : 'text-slate-700'}>
                        {emp.workload_ratio}x
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {emp.logged_hours}h / {emp.weekly_capacity_hours}h
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {emp.overtime_hours > 0 ? (
                        <span className="text-amber-600">+{emp.overtime_hours}h</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {emp.backlog_tasks > 3 ? (
                        <span className="text-rose-600 font-bold">{emp.backlog_tasks}</span>
                      ) : (
                        emp.backlog_tasks
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-600">
                      {emp.client_csat}★
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={emp.status_category} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, filteredEmployees.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> engineers
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Engineer Full Profile Drawer / Modal */}
      {inspectEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                  {inspectEmployee.employee_id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{inspectEmployee.name}</h3>
                <p className="text-xs text-slate-500">{inspectEmployee.role} • {inspectEmployee.department}</p>
              </div>
              <StatusBadge status={inspectEmployee.status_category} />
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Productivity</span>
                <p className="text-base font-bold text-sky-600 mt-0.5">{inspectEmployee.productivity_score} / 100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Workload Ratio</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{inspectEmployee.workload_ratio}x</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Overtime</span>
                <p className="text-base font-bold text-amber-600 mt-0.5">+{inspectEmployee.overtime_hours} hrs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Completed Tasks</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{inspectEmployee.completed_tasks} / {inspectEmployee.assigned_tasks}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Backlog Items</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{inspectEmployee.backlog_tasks}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Quality Rework</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{(inspectEmployee.quality_rework_rate * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <span className="text-xs font-semibold text-slate-600">Technical Skills Verified</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {inspectEmployee.skills.split(',').map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-sky-50 text-sky-800 text-xs rounded-md border border-sky-100 font-medium">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-800">Operational Assessment:</span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {inspectEmployee.workload_ratio > 1.25
                    ? 'Engineer is currently running with high overtime risk. Consider redistributing pending backlog tasks via OR-Tools.'
                    : inspectEmployee.workload_ratio < 0.80
                    ? 'Engineer has available capacity buffer. Eligible to absorb additional sprint backlog stories.'
                    : 'Balanced workload allocation. On track for sprint deliverable milestones.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setInspectEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
