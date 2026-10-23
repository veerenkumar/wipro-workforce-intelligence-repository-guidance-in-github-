import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers
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
  Legend
} from 'recharts';
import { workforceApi } from '../services/api';
import { ForecastingResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface ProductivityForecastingProps {
  selectedDept: string;
}

export const ProductivityForecasting: React.FC<ProductivityForecastingProps> = ({
  selectedDept
}) => {
  const [data, setData] = useState<ForecastingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workforceApi.getForecasting(
        selectedDept !== 'All Departments' ? selectedDept : undefined
      );
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate productivity forecasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedDept]);

  if (loading && !data) return <LoadingSpinner message="Training Random Forest model and computing SHAP attributions..." />;
  if (error && !data) return <ErrorBanner message={error} onRetry={fetchForecast} />;
  if (!data) return null;

  const evalMetrics = data.evaluation;

  // Format SHAP data for horizontal bar chart
  const shapChartData = (data.feature_importances || []).slice(0, 8).map((f) => ({
    name: f.feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    importance: Number((f.importance * 100).toFixed(1)),
    shap: Number((f.shap_value * 100).toFixed(1)),
    description: f.description
  }));

  return (
    <div className="space-y-6">
      {/* Algorithm & Chronological Integrity Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Machine Learning Productivity Forecast & SHAP Attribution</h3>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-mono rounded-md font-semibold border border-sky-100">
                  scikit-learn Random Forest
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Trained on chronological sprint series. Strict out-of-time evaluation to eliminate future information leakage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{evalMetrics.split_strategy}</span>
          </div>
        </div>

        {/* Model Evaluation Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Test Set MAE</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-900">{evalMetrics.mae} pts</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Mean absolute prediction error</p>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Baseline MAE (Rolling Mean)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-500">{evalMetrics.baseline_mae} pts</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Benchmark without ML signals</p>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 uppercase font-semibold text-[10px]">Accuracy Improvement</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-emerald-900">+{evalMetrics.relative_improvement_pct}%</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">Over naive historical mean</p>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-slate-500 uppercase font-semibold text-[10px]">R² Variance Explained</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-slate-900">{evalMetrics.r2_score}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Coefficient of determination</p>
          </div>
        </div>
      </div>

      {/* Main Timeline Projection Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Sprint Timeline Projection & 90% Confidence Band</h3>
            <p className="text-xs text-slate-500">Historical performance vs model forward forecasts into future sprints</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Historical Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Model Predicted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-100 border border-sky-300"></span> 90% Confidence Interval
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline_forecasts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="predicted_upper_bound"
                name="Confidence Upper Bound"
                stroke="transparent"
                fill="url(#bandGrad)"
              />
              <Area
                type="monotone"
                dataKey="predicted_lower_bound"
                name="Confidence Lower Bound"
                stroke="transparent"
                fill="url(#bandGrad)"
              />
              <Area
                type="monotone"
                dataKey="historical_actual"
                name="Historical Actual"
                stroke="#64748b"
                strokeWidth={2}
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="predicted_productivity"
                name="Predicted Productivity"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 2"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHAP Feature Importance & Attribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SHAP Importance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SHAP Feature Attribution Breakdown</h3>
              <p className="text-xs text-slate-500">Quantitative contribution of workforce signals to predicted team velocity</p>
            </div>
            <span className="text-xs font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-semibold">
              TreeExplainer
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={shapChartData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Relative Attribution']}
                />
                <Bar dataKey="importance" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability Insights Narrative (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">SHAP Evidence Synthesis</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Empirical findings derived from tree split path attributions</p>

            <div className="space-y-3 text-xs">
              {data.shap_summary_insights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Note: SHAP reflects correlative model decision boundaries, not counterfactual causal guarantees.
          </div>
        </div>
      </div>

      {/* Practice-Level Forward Projections Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Practice-Level Next-Sprint Forecasts & Risk Outlook</h4>
            <p className="text-xs text-slate-500">Projected velocity trends for upcoming delivery milestones</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Forward Outlook</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Technology Practice</th>
                <th className="py-2.5 px-4 text-right">Current Score</th>
                <th className="py-2.5 px-4 text-right">Projected (Next Month)</th>
                <th className="py-2.5 px-4 text-right">Expected Change</th>
                <th className="py-2.5 px-4 text-center">Projected Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.department_forecasts.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">{dept.department}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">{dept.current_productivity}</td>
                  <td className="py-3 px-4 text-right font-bold text-sky-600">{dept.forecasted_next_month}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    <span className={dept.expected_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {dept.expected_change_pct >= 0 ? `+${dept.expected_change_pct}%` : `${dept.expected_change_pct}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={dept.projected_risk_level} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
