import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s.includes('burnout') || s === 'critical' || s === 'rejected') {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s.includes('overload') || s === 'high') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s.includes('balanced') || s === 'optimal' || s === 'approved' || s === 'completed' || s === 'low') {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s.includes('underutil') || s === 'medium' || s === 'pending') {
    colorStyles = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (s === 'elevated') {
    colorStyles = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorStyles} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colorStyles.includes('rose') ? 'bg-rose-500' : colorStyles.includes('amber') ? 'bg-amber-500' : colorStyles.includes('emerald') ? 'bg-emerald-500' : colorStyles.includes('sky') ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
      {status}
    </span>
  );
};
