import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Sparkles,
  Scale,
  TrendingUp,
  Activity,
  Database,
  FileText,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Workforce Analytics', icon: Users },
    { to: '/bottlenecks', label: 'Bottleneck Detection', icon: AlertTriangle },
    { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/optimizer', label: 'Workload Optimizer', icon: Scale },
    { to: '/forecasting', label: 'Productivity Forecast', icon: TrendingUp },
    { to: '/anomalies', label: 'Anomaly Detection', icon: Activity },
    { to: '/datasets', label: 'Dataset Management', icon: Database },
    { to: '/reports', label: 'Reports & Exports', icon: FileText },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[#1E3E62]/60 z-20 shadow-xl">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E3E62]/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <span className="font-extrabold text-sm tracking-tight">W</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide leading-tight">Wipro Intelligence</h1>
            <p className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">Workforce & Capacity Agent</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Intelligence Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Operational Disclaimer */}
      <div className="p-4 border-t border-[#1E3E62]/70 bg-[#070F2B]/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-slate-300">OR-Tools & RF Agent</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Synthetic simulation environment. Algorithms calibrated for enterprise capacity planning.
        </p>
      </div>
    </aside>
  );
};
