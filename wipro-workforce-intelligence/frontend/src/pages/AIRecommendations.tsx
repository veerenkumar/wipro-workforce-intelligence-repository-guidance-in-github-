import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus,
  Filter,
  MessageSquare
} from 'lucide-react';
import { workforceApi } from '../services/api';
import { RecommendationResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner, ErrorBanner } from '../components/Feedback';

export const AIRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal for new intervention
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Workload Rebalance');
  const [newTarget, setNewTarget] = useState<string>('Cloud Infrastructure & Digital Workspace');
  const [newPriority, setNewPriority] = useState<string>('High');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newEvidence, setNewEvidence] = useState<string>('');
  const [newImpact, setNewImpact] = useState<string>('');
  const [newEffort, setNewEffort] = useState<string>('1 sprint');

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workforceApi.getRecommendations(
        statusFilter !== 'ALL' ? statusFilter : undefined,
        priorityFilter !== 'ALL' ? priorityFilter : undefined,
        categoryFilter !== 'ALL' ? categoryFilter : undefined
      );
      setRecommendations(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleUpdateStatus = async (recId: string, newStatus: string) => {
    try {
      setActionLoadingId(recId);
      await workforceApi.updateRecommendation(recId, newStatus, `Action logged at ${new Date().toLocaleTimeString()}`);
      // Refresh local list
      await fetchRecommendations();
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      alert('Please fill in title and description');
      return;
    }

    try {
      await workforceApi.createRecommendation({
        title: newTitle,
        category: newCategory,
        target_type: 'Department',
        target_name: newTarget,
        priority: newPriority,
        description: newDescription,
        evidence: newEvidence || 'Operational manager empirical request',
        projected_impact: newImpact || '+10% Throughput target',
        effort_estimate: newEffort
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewEvidence('');
      setNewImpact('');
      await fetchRecommendations();
    } catch (err: any) {
      alert(`Failed to create recommendation: ${err?.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Evidence-Backed Intervention Engine</h3>
              <p className="text-xs text-slate-500">Autonomous recommendation lifecycle connecting bottlenecks to quantifiable resolutions</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Propose Intervention
        </button>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority & Category Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Workload Rebalance">Workload Rebalance</option>
            <option value="Quality Gate">Quality Gate</option>
            <option value="Skill Augmentation">Skill Augmentation</option>
            <option value="Wellbeing">Wellbeing</option>
            <option value="Capacity">Capacity</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Evaluating recommendations and impact models..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchRecommendations} />
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No recommendations match the active filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec) => {
            const isActing = actionLoadingId === rec.rec_id;
            return (
              <div
                key={rec.rec_id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-semibold">
                        {rec.rec_id}
                      </span>
                      <StatusBadge status={rec.status} size="sm" />
                      <StatusBadge status={rec.priority} size="sm" />
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md font-medium">
                        {rec.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-2">{rec.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target: <span className="font-semibold text-slate-700">{rec.target_name}</span> ({rec.target_type})
                    </p>
                  </div>

                  {/* Impact Summary Pill */}
                  <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-100 px-3.5 py-2 rounded-xl shrink-0">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 uppercase font-semibold">Projected Impact</span>
                      <p className="text-xs font-bold text-emerald-900">{rec.projected_impact}</p>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-700">Action Plan:</span>
                      <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                        {rec.description}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Quantitative Evidence Signals:</span>
                      <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                        {rec.evidence}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">Effort Estimate:</span>
                        <p className="font-bold text-slate-800 mt-0.5">{rec.effort_estimate}</p>
                      </div>
                      {rec.notes && (
                        <div>
                          <span className="text-slate-500">Audit Notes:</span>
                          <p className="text-slate-700 italic mt-0.5">{rec.notes}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 text-[10px]">Updated: {new Date(rec.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons for Lifecycle Management */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 flex-wrap">
                      {rec.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(rec.rec_id, 'APPROVED')}
                            disabled={isActing}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec.rec_id, 'REJECTED')}
                            disabled={isActing}
                            className="py-1.5 px-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {rec.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(rec.rec_id, 'COMPLETED')}
                          disabled={isActing}
                          className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}

                      {rec.status === 'COMPLETED' && (
                        <span className="w-full text-center py-1 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Verified
                        </span>
                      )}

                      {rec.status === 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(rec.rec_id, 'PENDING')}
                          disabled={isActing}
                          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reopen Proposal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Intervention Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Propose Operational Intervention</h3>
            <p className="text-xs text-slate-500 mb-4">Create a custom workforce intervention for leadership review</p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Terraform Specialist Bench Surge for Sprint 40"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Workload Rebalance">Workload Rebalance</option>
                    <option value="Quality Gate">Quality Gate</option>
                    <option value="Skill Augmentation">Skill Augmentation</option>
                    <option value="Wellbeing">Wellbeing</option>
                    <option value="Capacity">Capacity</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Practice</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the procedural steps, reallocations, or tooling adjustments..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Projected Impact</label>
                  <input
                    type="text"
                    placeholder="e.g. -20% Overtime, +15% Throughput"
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Effort Estimate</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 sprint pairing"
                    value={newEffort}
                    onChange={(e) => setNewEffort(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
