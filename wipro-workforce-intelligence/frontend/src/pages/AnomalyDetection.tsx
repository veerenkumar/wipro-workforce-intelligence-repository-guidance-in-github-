import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { AnomalyResponse, AnomalyRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface AnomalyDetectionProps {
  selectedWeek: string;
  selectedDept: string;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  selectedWeek,
  selectedDept
}) => {
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workforceApi.getAnomalies(
        selectedWeek,
        selectedDept !== 'All Departments' ? selectedDept : undefined
      );
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to detect workforce anomalies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [selectedWeek, selectedDept]);

  if (loading && !data) return <LoadingSpinner message="Scanning multidimensional workforce distributions via Isolation Forest..." />;
  if (error && !data) return <ErrorBanner message={error} onRetry={fetchAnomalies} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Algorithm Header & Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Identified Anomalies</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.total_anomalies}</h3>
          <p className="text-xs text-slate-500 mt-1">Multi-variable behavioral outliers</p>
        </div>

        <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700 uppercase tracking-wider">Critical Outliers</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-700 mt-2">{data.high_severity_count}</h3>
          <p className="text-xs text-rose-600/80 mt-1">Anomaly score ≥ 80%</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contamination Rate</span>
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{(data.contamination_rate * 100).toFixed(1)}%</h3>
          <p className="text-xs text-slate-500 mt-1">Isolation Forest prior sensitivity</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Algorithm Model</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-2 truncate">Isolation Forest</h3>
          <p className="text-xs text-slate-500 mt-1">Tree partitioning + Z-score deviation</p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {data.anomalies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No behavioral or workload anomalies detected in Sprint {selectedWeek}.
          </div>
        ) : (
          data.anomalies.map((ano) => (
            <div
              key={ano.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      ano.anomaly_score >= 80
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-slate-500 font-semibold">{ano.id}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md font-medium">
                        {ano.anomaly_type}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {ano.employee_name} <span className="text-xs text-slate-400 font-normal">({ano.role})</span>
                    </h4>
                    <p className="text-xs text-slate-500">{ano.department} • Sprint {ano.week_id}</p>
                  </div>
                </div>

                {/* Anomaly Severity Gauge */}
                <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Anomaly Severity</span>
                    <p className={`text-base font-bold ${ano.anomaly_score >= 80 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {ano.anomaly_score}%
                    </p>
                  </div>
                  <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ano.anomaly_score >= 80 ? 'bg-rose-600' : 'bg-amber-500'}`}
                      style={{ width: `${ano.anomaly_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detected Feature Deviations */}
              <div className="my-3">
                <span className="text-xs font-semibold text-slate-600 block mb-1.5">Deviant Statistical Signals (Z-Scores):</span>
                <div className="flex flex-wrap gap-1.5">
                  {ano.detected_features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-100 text-xs rounded-md font-mono font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explanations and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50/60 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">Automated Diagnostic:</span>
                  <p className="text-slate-600 leading-relaxed">{ano.explanation}</p>
                </div>
                <div className="p-2.5 bg-sky-50/40 rounded-lg border border-sky-100/60">
                  <span className="font-semibold text-sky-800 block mb-0.5">Suggested Investigation Protocol:</span>
                  <p className="text-sky-900 leading-relaxed">{ano.suggested_investigation}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
