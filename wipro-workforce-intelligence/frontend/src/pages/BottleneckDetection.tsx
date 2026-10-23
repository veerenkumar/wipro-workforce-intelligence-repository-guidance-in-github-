import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Flame,
  Layers,
  Wrench,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { BottleneckSummaryResponse, BottleneckItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';
import { useNavigate } from 'react-router-dom';

interface BottleneckDetectionProps {
  selectedWeek: string;
  selectedDept: string;
}

export const BottleneckDetection: React.FC<BottleneckDetectionProps> = ({
  selectedWeek,
  selectedDept
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState<BottleneckSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const fetchBottlenecks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workforceApi.getBottlenecks(
        selectedWeek,
        selectedDept !== 'All Departments' ? selectedDept : undefined
      );
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze operational bottlenecks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBottlenecks();
  }, [selectedWeek, selectedDept]);

  if (loading && !data) return <LoadingSpinner message="Diagnosing workflow bottlenecks and capacity constraints..." />;
  if (error && !data) return <ErrorBanner message={error} onRetry={fetchBottlenecks} />;
  if (!data) return null;

  const filteredBottlenecks = data.bottlenecks.filter((b) => {
    if (severityFilter === 'ALL') return true;
    return b.severity.toUpperCase() === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Identified Bottlenecks</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.total_bottlenecks}</h3>
          <p className="text-xs text-slate-500 mt-1">Operational workflow blockers detected</p>
        </div>

        <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700 uppercase tracking-wider">Critical Severity</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-700 mt-2">{data.critical_count}</h3>
          <p className="text-xs text-rose-600/80 mt-1">Requires immediate intervention</p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">High Severity</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-700 mt-2">{data.high_count}</h3>
          <p className="text-xs text-amber-600/80 mt-1">Impacting sprint commitments</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Est. Capacity Drag</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.estimated_total_loss_hours} hrs</h3>
          <p className="text-xs text-slate-500 mt-1">Weekly lost engineering throughput</p>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Severity:</span>
          <div className="flex items-center gap-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/optimizer')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          Auto-Resolve via Workload Optimizer
        </button>
      </div>

      {/* Bottlenecks List */}
      <div className="space-y-4">
        {filteredBottlenecks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No operational bottlenecks detected in this category. Workflows operating within normal limits.
          </div>
        ) : (
          filteredBottlenecks.map((btn) => (
            <div
              key={btn.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      btn.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : btn.severity === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-slate-400 font-medium">{btn.id}</span>
                      <StatusBadge status={btn.severity} size="sm" />
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md font-medium">
                        {btn.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{btn.title}</h4>
                    <p className="text-xs text-slate-500 font-normal">{btn.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Weekly Capacity Drag</span>
                    <p className="text-sm font-bold text-rose-600">~{btn.estimated_weekly_loss_hours} hrs</p>
                  </div>
                  <div className="text-right border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Affected Staff</span>
                    <p className="text-sm font-bold text-slate-900">{btn.affected_count} engineers</p>
                  </div>
                </div>
              </div>

              {/* Explanations & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    Observed Bottleneck Dynamics:
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {btn.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Identified Root Cause:
                  </span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {btn.root_cause}
                  </p>
                </div>
              </div>

              {/* Evidence Signals & Affected Entities */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-medium">Impact Signals:</span>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-800 font-medium rounded-md border border-rose-100">
                    {btn.impact_metrics}
                  </span>
                  <span className="text-slate-400 font-medium ml-2">Sample Entities:</span>
                  {btn.affected_entities.slice(0, 3).map((e) => (
                    <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px]">
                      {e}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Recommendation
                  </button>
                  <button
                    onClick={() => navigate('/optimizer')}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    Rebalance <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
