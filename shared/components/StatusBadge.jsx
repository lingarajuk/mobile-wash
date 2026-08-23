import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    Upcoming: { color: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', icon: Clock },
    Ongoing: { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: RefreshCw },
    'In Progress': { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: RefreshCw },
    'On The Way': { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: RefreshCw },
    Arrived: { color: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]', icon: CheckCircle2 },
    Accepted: { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: CheckCircle2 },
    Completed: { color: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', icon: CheckCircle2 },
    Cancelled: { color: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]', icon: XCircle },
    Paid: { color: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', icon: ShieldCheck },
    Pending: { color: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', icon: AlertCircle },
    'Pending Verification': { color: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', icon: AlertCircle },
    Verified: { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: CheckCircle2 },
    Assigned: { color: 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]', icon: Clock },
    Active: { color: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', icon: CheckCircle2 },
    Inactive: { color: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]', icon: XCircle },
    Available: { color: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', icon: CheckCircle2 },
    'On Job': { color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: RefreshCw }
  };

  const config = configs[status] || { color: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]', icon: AlertCircle };
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5 font-bold';

  return (
    <span className={`inline-flex items-center border rounded-full ${sizeClasses} ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'Ongoing' || status === 'In Progress' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
      <span>{status}</span>
    </span>
  );
};
