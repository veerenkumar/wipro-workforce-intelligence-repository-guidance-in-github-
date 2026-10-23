import React from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Award,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Scale,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';
import { AnalyticsDashboardResponse, EmployeeDetail } from '../types';
import { useNavigate } from 'react-router-dom';

interface ExecutiveDashboardProps {
  data: AnalyticsDashboardResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  data,
  loading,
  error,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeDetail | null>(null);

  if (loading && !data) return <LoadingSpinner message="Aggregating workforce intelligence metrics..." />;
  if (error && !data) return <ErrorBanner message={error} onRetry={onRefresh} />;
  if (!data) return null;

  const kpis = data.kpis;
  const isElevatedRisk = kpis.operational_alert_level === 'Critical' || kpis.operational_alert_level === 'Elevated';

  const WORKLOAD_COLORS: Record<string, string> = {
    'Balanced': '#10b981',
    'Overloaded': '#f59e0b',
    'Underutilized': '#38bdf8',
    'Burnout Risk': '#ef4444'
  };

  const pieData = Object.entries(data.workload_distribution).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Operational Alert Banner */}
      {isElevatedRisk && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">Operational Alert: {kpis.operational_alert_level} Capacity Strain</h4>
                <StatusBadge status={kpis.operational_alert_level} size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {kpis.burnout_risk_count} engineers are in critical burnout territory and {kpis.overloaded_count} are running over capacity. Total overtime reached {kpis.total_overtime_hours} hrs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/bottlenecks')}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Inspect Bottlenecks
            </button>
            <button
              onClick={() => navigate('/optimizer')}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              Launch Optimizer
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Productivity Score"
          value={`${kpis.avg_productivity_score}`}
          subtitle="Target: 80.0 / 100"
          icon={Zap}
          trend={{ value: `${kpis.avg_productivity_score >= 75 ? '+3.4%' : '-2.1%'} vs baseline`, isPositive: kpis.avg_productivity_score >= 75 }}
          accentColor="blue"
        />
        <KPICard
          title="Workload Ratio"
          value={`${kpis.avg_workload_ratio}x`}
          subtitle="Optimal: 0.90x - 1.15x"
          icon={Scale}
          trend={{ value: `${kpis.avg_workload_ratio > 1.15 ? 'Over capacity' : 'Healthy range'}`, isPositive: kpis.avg_workload_ratio <= 1.15 }}
          accentColor={kpis.avg_workload_ratio > 1.25 ? 'rose' : kpis.avg_workload_ratio > 1.15 ? 'amber' : 'emerald'}
        />
        <KPICard
          title="Total Overtime"
          value={`${kpis.total_overtime_hours}h`}
          subtitle={`${kpis.overloaded_count + kpis.burnout_risk_count} staff logging OT`}
          icon={Clock}
          trend={{ value: `${kpis.total_overtime_hours > 60 ? 'Elevated' : 'Controlled'}`, isPositive: kpis.total_overtime_hours <= 60 }}
          accentColor="amber"
        />
        <KPICard
          title="Task Completion"
          value={`${kpis.task_completion_rate}%`}
          subtitle="Sprint story commitments"
          icon={CheckCircle2}
          trend={{ value: `${kpis.task_completion_rate >= 85 ? 'On schedule' : 'Pacing risk'}`, isPositive: kpis.task_completion_rate >= 85 }}
          accentColor="teal"
        />
        <KPICard
          title="Absenteeism"
          value={`${kpis.avg_absenteeism_days}d`}
          subtitle="Average days / sprint"
          icon={HeartPulse}
          trend={{ value: `${kpis.avg_absenteeism_days > 1.5 ? 'Fatigue signal' : 'Normal'}`, isPositive: kpis.avg_absenteeism_days <= 1.5 }}
          accentColor="rose"
        />
        <KPICard
          title="Client CSAT"
          value={`${kpis.avg_client_csat}`}
          subtitle="Scale: 1.0 to 5.0"
          icon={Award}
          trend={{ value: `${kpis.avg_client_csat >= 4.2 ? 'Exceeding SLA' : 'Meeting SLA'}`, isPositive: kpis.avg_client_csat >= 4.0 }}
          accentColor="emerald"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity & Workload Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Productivity & Workload Velocity</h3>
              <p className="text-xs text-slate-500">Dual-axis view across consecutive sprint cycles</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Productivity Score
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Workload Ratio (x100)
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weekly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week_id" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 150]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: string) => {
                    if (name === 'Scaled Workload Ratio') return [`${(Number(val) / 100).toFixed(2)}x`, 'Workload Ratio'];
                    return [val, name];
                  }}
                />
                <Area type="monotone" dataKey="productivity" name="Productivity Score" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#prodGradient)" />
                <Area
                  type="monotone"
                  dataKey={(d) => Math.round(d.workload_ratio * 100)}
                  name="Scaled Workload Ratio"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#loadGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Distribution Donut (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Workforce Capacity Status</h3>
            <p className="text-xs text-slate-500">Current allocation across {kpis.total_active_workforce} engineers</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WORKLOAD_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-600 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WORKLOAD_COLORS[item.name] }}></span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Practice-Level Productivity vs Overtime Burden</h3>
            <p className="text-xs text-slate-500">Comparative velocity across Wipro technology units</p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
          >
            Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.department_metrics}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="department"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                interval={0}
                tickFormatter={(val) => val.split(' ')[0] + ' ' + (val.split(' ')[1] || '')}
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avg_productivity" name="Avg Productivity Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_overtime" name="Total Overtime (Hours)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Summary Columns: Top Performers & At-Risk Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">High Velocity & Quality Leaders</h3>
                <p className="text-xs text-slate-500">Highest composite productivity & delivery quality</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Top 6</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider">
                  <th className="pb-2.5">Engineer</th>
                  <th className="pb-2.5">Practice</th>
                  <th className="pb-2.5 text-right">Score</th>
                  <th className="pb-2.5 text-right">CSAT</th>
                  <th className="pb-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.top_performers.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.role}</div>
                    </td>
                    <td className="py-2.5 text-slate-600 max-w-[130px] truncate">{emp.department}</td>
                    <td className="py-2.5 text-right font-bold text-sky-600">{emp.productivity_score}</td>
                    <td className="py-2.5 text-right font-medium text-emerald-600">{emp.client_csat}★</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={emp.status_category} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* At-Risk Staff (Burnout / Overload Watchlist) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Burnout & Overload Watchlist</h3>
                <p className="text-xs text-slate-500">Sustained high ratios, overtime surge, and backlog risk</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/optimizer')}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              Rebalance <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider">
                  <th className="pb-2.5">Engineer</th>
                  <th className="pb-2.5 text-right">Workload</th>
                  <th className="pb-2.5 text-right">Overtime</th>
                  <th className="pb-2.5 text-right">Backlog</th>
                  <th className="pb-2.5 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.at_risk_employees.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.role}</div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-rose-600">{emp.workload_ratio}x</td>
                    <td className="py-2.5 text-right font-medium text-amber-600">+{emp.overtime_hours}h</td>
                    <td className="py-2.5 text-right text-slate-600">{emp.backlog_tasks} tasks</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={emp.status_category} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Quick Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-medium">
                  {selectedEmployee.employee_id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEmployee.name}</h3>
                <p className="text-xs text-slate-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
              </div>
              <StatusBadge status={selectedEmployee.status_category} />
            </div>

            <div className="grid grid-cols-2 gap-3 my-5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Productivity Score</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{selectedEmployee.productivity_score} / 100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Workload Ratio</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{selectedEmployee.workload_ratio}x ({selectedEmployee.logged_hours}h / {selectedEmployee.weekly_capacity_hours}h)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Overtime Logged</span>
                <p className="text-base font-bold text-amber-600 mt-0.5">+{selectedEmployee.overtime_hours} hrs</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Quality Rework Rate</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{(selectedEmployee.quality_rework_rate * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Skills Profile</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedEmployee.skills.split(',').map((s) => (
                  <span key={s} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  navigate('/optimizer');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Optimize Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
