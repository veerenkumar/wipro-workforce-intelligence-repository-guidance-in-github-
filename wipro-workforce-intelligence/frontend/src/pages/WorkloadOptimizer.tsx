import React, { useState } from 'react';
import {
  Scale,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  RotateCcw,
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
  Legend,
  ReferenceLine
} from 'recharts';
import { workforceApi } from '../services/api';
import { OptimizationResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface WorkloadOptimizerProps {
  selectedDept: string;
  availableDepts: string[];
}

export const WorkloadOptimizer: React.FC<WorkloadOptimizerProps> = ({
  selectedDept,
  availableDepts
}) => {
  const [department, setDepartment] = useState<string>(selectedDept || 'All Departments');
  const [maxThreshold, setMaxThreshold] = useState<number>(1.15);
  const [balanceWeight, setBalanceWeight] = useState<number>(0.5);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResponse | null>(null);

  const handleRunOptimizer = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workforceApi.runOptimizer({
        department: department !== 'All Departments' ? department : undefined,
        max_workload_threshold: maxThreshold,
        balance_weights: balanceWeight
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Workload optimization solver encountered an error');
    } finally {
      setLoading(false);
    }
  };

  // Run on first load if not run yet
  React.useEffect(() => {
    handleRunOptimizer();
  }, [department]);

  // Comparison chart data
  const chartData = (result?.workload_shifts || []).slice(0, 15).map((shift) => ({
    name: shift.name.split(' ')[0],
    initial: Number(shift.initial_workload_ratio.toFixed(2)),
    optimized: Number(shift.optimized_workload_ratio.toFixed(2)),
    statusBefore: shift.status_before,
    statusAfter: shift.status_after
  }));

  return (
    <div className="space-y-6">
      {/* Parameter Configuration & Solver Trigger Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-teal-400 text-white rounded-xl shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google OR-Tools Workload Redistribution Solver</h3>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-mono rounded-md font-semibold border border-sky-100">
                  CP-SAT / SCIP MILP
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Constrained mathematical programming enforcing skill verification, capacity ceilings, and variance minimization
              </p>
            </div>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={loading}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50 self-start lg:self-auto cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Solving Model...' : 'Execute OR-Tools Optimization'}
          </button>
        </div>

        {/* Solver Constraints Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Department Scope */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Optimization Scope (Practice)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All Departments">All Technology Practices</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">Scope tasks and engineers to department boundaries</span>
          </div>

          {/* Maximum Workload Ratio Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Max Capacity Ceiling (Threshold)</label>
              <span className="font-bold text-sky-600 font-mono text-xs">{maxThreshold.toFixed(2)}x ({(maxThreshold * 40).toFixed(0)}h)</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={1.35}
              step={0.05}
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Prevents allocating work that causes engineer burnout</span>
          </div>

          {/* Balance Weight Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Balancing vs Velocity Weight</label>
              <span className="font-bold text-teal-600 font-mono text-xs">{Math.round(balanceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.1}
              value={balanceWeight}
              onChange={(e) => setBalanceWeight(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Favor equitable workload balance vs urgent deadline urgency</span>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRunOptimizer} />}

      {loading && !result && <LoadingSpinner message="Solving integer programming allocation model..." />}

      {result && (
        <div className="space-y-6">
          {/* Solver Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tasks Dispatched</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-bold text-slate-900">{result.total_tasks_assigned}</h3>
                <span className="text-xs text-slate-400 font-medium">/ {result.total_tasks_assigned + result.unassigned_tasks_count}</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">100% Verified skill match</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workload Variance Reduction</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-bold text-teal-600">-{result.workload_variance_reduction_percent}%</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Smoother capacity distribution</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Workload Shift</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-bold text-slate-900">{result.avg_workload_ratio_before}x → {result.avg_workload_ratio_after}x</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Healthy team utilization range</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs bg-gradient-to-br from-white to-sky-50/30">
              <span className="text-xs font-medium text-sky-700 uppercase tracking-wider">OR-Tools Solver Status</span>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-900">{result.status}</h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{result.solver_message}</p>
            </div>
          </div>

          {/* Visual Comparison: Workload Before vs After Redistribution */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Before-and-After Workload Ratio Comparison</h3>
                <p className="text-xs text-slate-500">Comparing individual engineer capacity saturation before and after OR-Tools optimization</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span> Initial Workload Ratio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-600"></span> Optimized Workload Ratio
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 1.8]} tickLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: string) => [`${val}x`, name]}
                  />
                  <ReferenceLine y={maxThreshold} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `Ceiling (${maxThreshold}x)`, fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                  <Bar dataKey="initial" name="Initial Ratio" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized Ratio" fill="#0284c7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Assignments Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Optimized Task Assignment Schedule</h4>
                <p className="text-xs text-slate-500">Mathematically verified assignments matching task skill requirements</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">{result.assignments.length} assignments</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Task ID</th>
                    <th className="py-2.5 px-4">Deliverable Title</th>
                    <th className="py-2.5 px-4">Required Skill</th>
                    <th className="py-2.5 px-4">Allocated Engineer</th>
                    <th className="py-2.5 px-3 text-right">Effort Hours</th>
                    <th className="py-2.5 px-3 text-right">Priority</th>
                    <th className="py-2.5 px-4 text-center">Solver Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.assignments.map((asg) => (
                    <tr key={asg.task_id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600">{asg.task_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{asg.task_title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px]">
                          {asg.required_skill}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{asg.assigned_employee_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{asg.assigned_employee_id}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{asg.allocated_hours}h</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold text-[11px]">
                          P{asg.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {asg.match_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
