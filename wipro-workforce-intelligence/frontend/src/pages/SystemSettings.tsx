import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  EyeOff,
  Bell,
  CheckCircle2,
  Sparkles,
  Scale
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { SystemSettingsSchema } from '../types';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

interface SystemSettingsProps {
  onSettingsSaved: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<SystemSettingsSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workforceApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      await workforceApi.updateSettings(settings);
      setSuccessMsg('Settings updated successfully. All workforce productivity scores recalculated.');
      onSettingsSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all scoring weights and operational thresholds to baseline factory defaults?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      const res = await workforceApi.resetSettings();
      setSettings(res);
      setSuccessMsg('Settings restored to default enterprise parameters.');
      onSettingsSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) return <LoadingSpinner message="Loading configurable intelligence parameters..." />;
  if (error && !settings) return <ErrorBanner message={error} onRetry={fetchSettings} />;
  if (!settings) return null;

  // Weight total
  const weightSum = (
    settings.weight_task_completion +
    settings.weight_quality +
    settings.weight_csat +
    settings.weight_adherence
  ).toFixed(2);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Settings Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">System Configuration & Algorithm Weights</h3>
            <p className="text-xs text-slate-500">Fine-tune productivity scoring formulas, capacity bounds, and privacy anonymization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Recalculating...' : 'Save & Recalculate'}
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Productivity Scoring Weights */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Weighted Productivity Scoring Engine</h4>
              <p className="text-xs text-slate-500">Determines how individual and team productivity scores (0-100) are computed</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${weightSum === '1.00' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              Weight Sum: {weightSum} / 1.00
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Task Completion Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Task Completion Rate</label>
                <span className="font-bold text-sky-600 font-mono">{(settings.weight_task_completion * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.70}
                step={0.05}
                value={settings.weight_task_completion}
                onChange={(e) => setSettings({ ...settings, weight_task_completion: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Throughput of sprint commitments finished</span>
            </div>

            {/* Quality Rework Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Deliverable Quality (Low Rework)</label>
                <span className="font-bold text-teal-600 font-mono">{(settings.weight_quality * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.70}
                step={0.05}
                value={settings.weight_quality}
                onChange={(e) => setSettings({ ...settings, weight_quality: parseFloat(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Inverses penalty for defects requiring patch rework</span>
            </div>

            {/* Client CSAT Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Client Satisfaction (CSAT)</label>
                <span className="font-bold text-emerald-600 font-mono">{(settings.weight_csat * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.50}
                step={0.05}
                value={settings.weight_csat}
                onChange={(e) => setSettings({ ...settings, weight_csat: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Evaluated client sprint feedback (1-5 scale)</span>
            </div>

            {/* Schedule Adherence Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Schedule & Capacity Adherence</label>
                <span className="font-bold text-indigo-600 font-mono">{(settings.weight_adherence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.50}
                step={0.05}
                value={settings.weight_adherence}
                onChange={(e) => setSettings({ ...settings, weight_adherence: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Penalizes extreme overtime surges or severe underutilization</span>
            </div>
          </div>
        </div>

        {/* Section 2: Workload Ratio Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h4 className="text-sm font-bold text-slate-900">Workload-to-Capacity Classification Thresholds</h4>
            <p className="text-xs text-slate-500">Defines categorical boundaries for workload statuses and burnout alerts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">Underutilized Ceiling</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.05}
                  min={0.5}
                  max={0.95}
                  value={settings.threshold_underutilized}
                  onChange={(e) => setSettings({ ...settings, threshold_underutilized: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                />
                <span className="text-slate-500">x</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">&lt; threshold is Underutilized</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">Optimal Range Upper Bound</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.05}
                  min={0.9}
                  max={1.3}
                  value={settings.threshold_optimal_max}
                  onChange={(e) => setSettings({ ...settings, threshold_optimal_max: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                />
                <span className="text-slate-500">x</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Balanced upper ceiling</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">Overload Warning Bound</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.05}
                  min={1.1}
                  max={1.5}
                  value={settings.threshold_overload_warning}
                  onChange={(e) => setSettings({ ...settings, threshold_overload_warning: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-amber-600"
                />
                <span className="text-slate-500">x</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Triggers overload warnings</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">Critical Burnout Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.05}
                  min={1.25}
                  max={2.0}
                  value={settings.threshold_critical_burnout}
                  onChange={(e) => setSettings({ ...settings, threshold_critical_burnout: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-rose-600"
                />
                <span className="text-slate-500">x</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">&gt; threshold triggers burnout alert</span>
            </div>
          </div>
        </div>

        {/* Section 3: Privacy & Anonymization */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h4 className="text-sm font-bold text-slate-900">Enterprise Privacy & Governance</h4>
            <p className="text-xs text-slate-500">Controls data masking in dashboards, tables, exports and executive briefs</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Anonymize Personnel Identifiers</span>
                  <p className="text-slate-500">Replaces engineer names with generic tokens (e.g. Resource 1024) across all views</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.anonymize_employee_data}
                  onChange={(e) => setSettings({ ...settings, anonymize_employee_data: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Mask Sensitive Financial Attributes</span>
                  <p className="text-slate-500">Restricts billing and compensation indices to delivery authorized personnel</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mask_salary_or_sensitive}
                  onChange={(e) => setSettings({ ...settings, mask_salary_or_sensitive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Operational Anomaly Sensitivity */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h4 className="text-sm font-bold text-slate-900">Isolation Forest Prior Sensitivity</h4>
            <p className="text-xs text-slate-500">Controls the contamination parameter for unsupervised outlier detection</p>
          </div>

          <div className="text-xs max-w-md">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Contamination Ratio</label>
              <span className="font-bold text-sky-600 font-mono">{(settings.anomaly_sensitivity * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.20}
              step={0.01}
              value={settings.anomaly_sensitivity}
              onChange={(e) => setSettings({ ...settings, anomaly_sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Higher values flag more subtle deviations; lower values isolate extreme outliers</span>
          </div>
        </div>
      </form>
    </div>
  );
};
