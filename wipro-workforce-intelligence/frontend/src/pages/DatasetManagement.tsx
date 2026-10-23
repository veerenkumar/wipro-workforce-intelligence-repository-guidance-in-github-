import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  RefreshCw,
  FileCheck,
  AlertCircle,
  FileText,
  Sparkles,
  CheckCircle2,
  Table,
  Layers
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { DatasetStatus } from '../types';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface DatasetManagementProps {
  onDatasetReload: () => void;
}

export const DatasetManagement: React.FC<DatasetManagementProps> = ({ onDatasetReload }) => {
  const [status, setStatus] = useState<DatasetStatus | null>(null);
  const [previewRecords, setPreviewRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synthetic Generator state
  const [numEmployees, setNumEmployees] = useState<number>(60);
  const [seed, setSeed] = useState<number>(42);

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const fetchStatusAndPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sData, pData] = await Promise.all([
        workforceApi.getDatasetStatus(),
        workforceApi.previewDataset(12)
      ]);
      setStatus(sData);
      setPreviewRecords(pData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch dataset status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndPreview();
  }, []);

  const handleGenerateSynthetic = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await workforceApi.generateSynthetic(numEmployees, seed);
      setSuccessMsg(res.message);
      await fetchStatusAndPreview();
      onDatasetReload();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate synthetic dataset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      setUploadErrors([]);
      const res = await workforceApi.uploadCSV(selectedFile);
      setSuccessMsg(res.message);
      setSelectedFile(null);
      await fetchStatusAndPreview();
      onDatasetReload();
    } catch (err: any) {
      if (err?.response?.data?.detail?.errors) {
        setUploadErrors(err.response.data.detail.errors);
      } else {
        setError(err?.response?.data?.detail || 'CSV upload failed');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !status) return <LoadingSpinner message="Checking database store status..." />;

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Synthetic Enterprise Data Standard:</span>
          <p className="mt-0.5 text-sky-800 leading-relaxed">
            All dataset records are synthetically modeled around representative Wipro technology business units (Cloud, Enterprise SAP, AI Solutions, Cybersecurity, BFSI, Healthcare) for simulation, capacity planning, and algorithmic optimization. No actual internal employee records are used or claimed.
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchStatusAndPreview} />}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dataset Overview Cards */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Records in Store</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{status.total_records}</h3>
            <p className="text-xs text-slate-500 mt-1">Stored in local SQLite database</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unique Personnel</span>
            <h3 className="text-2xl font-bold text-sky-600 mt-2">{status.unique_employees}</h3>
            <p className="text-xs text-slate-500 mt-1">Engineers across all practice tiers</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sprint Weeks Tracked</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{status.weeks.length} Weeks</h3>
            <p className="text-xs text-slate-500 mt-1">{status.weeks[0]} to {status.weeks[status.weeks.length - 1]}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Technology Practices</span>
            <h3 className="text-2xl font-bold text-teal-600 mt-2">{status.departments.length} Units</h3>
            <p className="text-xs text-slate-500 mt-1">Multi-practice delivery matrix</p>
          </div>
        </div>
      )}

      {/* Action Row: Synthetic Generator & CSV Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synthetic Generator Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Synthetic Workforce Generator</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Instantly generate realistic multi-sprint records with realistic overtime, task completion, and rework parameters.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Workforce Headcount (Personnel)</label>
                  <span className="font-bold text-sky-600 font-mono">{numEmployees} Engineers</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={10}
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Generates {numEmployees * 12} sprint records (12 weeks)</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Random Seed (Reproducibility)</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={handleGenerateSynthetic}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              {actionLoading ? 'Generating Dataset...' : 'Generate & Ingest Synthetic Dataset'}
            </button>
          </div>
        </div>

        {/* CSV File Upload Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Upload Custom Workforce CSV</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ingest your own sprint metrics file. Validates schema and recalculates all intelligence algorithms automatically.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-3 text-xs">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-file-input"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="font-semibold text-sky-600 hover:underline">
                    {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Must contain standard workforce schema columns</p>
                </label>
              </div>

              {uploadErrors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-xs">
                  <span className="font-bold block mb-1">Schema Validation Errors:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {uploadErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || actionLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {actionLoading ? 'Validating & Ingesting...' : 'Validate & Upload Dataset'}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Required: employee_id, logged_hours, capacity, etc.</span>
            <a href="/api/v1/reports/csv" className="text-sky-600 hover:underline font-medium">
              Download Sample Template
            </a>
          </div>
        </div>
      </div>

      {/* Dataset Records Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Database Record Snapshot (Preview)</h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">Top 12 Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Practice</th>
                <th className="py-2.5 px-2 text-right">Sprint</th>
                <th className="py-2.5 px-2 text-right">Logged/Cap</th>
                <th className="py-2.5 px-2 text-right">Done/Assigned</th>
                <th className="py-2.5 px-2 text-right">Backlog</th>
                <th className="py-2.5 px-2 text-right">Score</th>
                <th className="py-2.5 px-2 text-right">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono font-medium text-sky-600">{r.employee_id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.role}</td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]">{r.department}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">{r.week_id}</td>
                  <td className="py-2.5 px-2 text-right text-slate-700">{r.logged_hours}h / {r.weekly_capacity}h</td>
                  <td className="py-2.5 px-2 text-right text-slate-700">{r.completed_tasks} / {r.assigned_tasks}</td>
                  <td className="py-2.5 px-2 text-right font-medium text-amber-700">{r.backlog_tasks}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-sky-600">{r.productivity_score}</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-slate-900">{r.workload_ratio}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
