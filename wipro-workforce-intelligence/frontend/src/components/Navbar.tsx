import React from 'react';
import { RefreshCw, Calendar, Building2, BellRing, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  title: string;
  subtitle?: string;
  selectedWeek: string;
  availableWeeks: string[];
  onWeekChange: (week: string) => void;
  selectedDept: string;
  availableDepts: string[];
  onDeptChange: (dept: string) => void;
  alertLevel?: 'Normal' | 'Moderate' | 'Elevated' | 'Critical';
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  selectedWeek,
  availableWeeks,
  onWeekChange,
  selectedDept,
  availableDepts,
  onDeptChange,
  alertLevel = 'Normal',
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
      </div>

      {/* Global Controls & Filters */}
      <div className="flex items-center gap-3">
        {/* Department Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[160px] truncate"
          >
            <option value="All Departments">All Practices</option>
            {availableDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Week Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedWeek}
            onChange={(e) => onWeekChange(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            {availableWeeks.map((w) => (
              <option key={w} value={w}>
                Sprint {w}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Alert Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Alert Level:</span>
          <StatusBadge status={alertLevel} size="sm" />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Intelligence Metrics"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
