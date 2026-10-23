import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Layers
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';

interface ReportsExportProps {
  selectedWeek: string;
  selectedDept: string;
}

export const ReportsExport: React.FC<ReportsExportProps> = ({ selectedWeek, selectedDept }) => {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await workforceApi.getSummaryJson(selectedWeek);
        setSummaryData(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load report summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedWeek]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !summaryData) return <LoadingSpinner message="Assembling executive management report..." />;
  if (error && !summaryData) return <ErrorBanner message={error} />;

  const kpis = summaryData?.kpi_summary;
  const bottlenecks = summaryData?.bottlenecks?.bottlenecks || [];

  return (
    <div className="space-y-6">
      {/* Export Action Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Executive Report & Dataset Exporter</h3>
              <p className="text-xs text-slate-500">Download audit-ready PDF dossiers, raw workforce metrics, or print management briefs</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Executive PDF */}
          <a
            href={workforceApi.downloadPDFUrl(selectedWeek)}
            download="wipro_workforce_intelligence_report.pdf"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF Dossier
          </a>

          {/* Download Raw CSV */}
          <a
            href={workforceApi.downloadCSVUrl()}
            download="wipro_workforce_dataset.csv"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV Dataset
          </a>

          {/* Print Summary */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print Brief
          </button>
        </div>
      </div>

      {/* Printable Management Summary Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sky-600 text-lg tracking-wider">WIPRO</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Workforce Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Executive Capacity & Productivity Assessment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation Sprint: <span className="font-semibold text-slate-800">{selectedWeek}</span> • Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-right flex flex-col sm:items-end">
            <span className="text-xs text-slate-400 font-medium">Operational Status:</span>
            <div className="mt-1">
              <StatusBadge status={kpis?.operational_alert_level || 'Normal'} />
            </div>
          </div>
        </div>

        {/* Executive KPI Snapshot Grid */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Velocity & Workload Metrics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Productivity Score</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis?.avg_productivity_score} / 100</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Workload Ratio</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis?.avg_workload_ratio}x</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Active Workforce</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis?.total_active_workforce} staff</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Total Overtime</span>
              <p className="text-lg font-bold text-amber-600 mt-0.5">{kpis?.total_overtime_hours} hrs</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Completion Rate</span>
              <p className="text-lg font-bold text-teal-600 mt-0.5">{kpis?.task_completion_rate}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Quality Rework Rate</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{(100 - (kpis?.avg_quality_score || 90)).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Practice Breakdown Table */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Practice-Level Matrix</h4>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Technology Practice</th>
                  <th className="py-2.5 px-2 text-right">Headcount</th>
                  <th className="py-2.5 px-2 text-right">Productivity</th>
                  <th className="py-2.5 px-2 text-right">Workload Ratio</th>
                  <th className="py-2.5 px-2 text-right">Overtime</th>
                  <th className="py-2.5 px-2 text-right">Client CSAT</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(summaryData?.department_metrics || []).map((dept: any) => (
                  <tr key={dept.department}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{dept.department}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{dept.employee_count}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-sky-600">{dept.avg_productivity}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800">{dept.avg_workload_ratio}x</td>
                    <td className="py-2.5 px-2 text-right text-amber-600 font-medium">+{dept.total_overtime}h</td>
                    <td className="py-2.5 px-2 text-right text-emerald-600 font-medium">{dept.avg_csat}★</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={dept.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Active Bottlenecks Synopsis */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Active Operational Bottlenecks</h4>
          <div className="space-y-2 text-xs">
            {bottlenecks.slice(0, 3).map((btn: any) => (
              <div key={btn.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-600 font-semibold">{btn.id}</span>
                    <span className="font-bold text-slate-900">{btn.title}</span>
                    <StatusBadge status={btn.severity} size="sm" />
                  </div>
                  <p className="text-slate-600 mt-1">{btn.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Weekly Drag</span>
                  <span className="font-bold text-rose-600">~{btn.estimated_weekly_loss_hours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Confidential • Wipro Workforce Intelligence Simulation Environment</span>
          <span>Algorithms: Google OR-Tools CP-SAT & Random Forest Regressor</span>
        </div>
      </div>
    </div>
  );
};
