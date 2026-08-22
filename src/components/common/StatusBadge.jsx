import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    Upcoming: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
    Ongoing: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: RefreshCw },
    'In Progress': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: RefreshCw },
    Completed: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    Cancelled: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
    Paid: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: ShieldCheck },
    Pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: AlertCircle },
    Active: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    Inactive: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: XCircle },
    Available: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    'On Job': { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: RefreshCw }
  };

  const config = configs[status] || { color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: AlertCircle };
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${sizeClasses} ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'Ongoing' || status === 'In Progress' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
      <span>{status}</span>
    </span>
  );
};
