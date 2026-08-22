import React from 'react';
import { ADMIN_ANALYTICS_DATA, INITIAL_EMPLOYEES } from '../../data/mockData';
import { BarChart3, TrendingUp, Award, Users, CheckCircle2, DollarSign, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminReportsPage = () => {
  const { addToast } = useToast();
  const stats = ADMIN_ANALYTICS_DATA;

  const handleExport = () => {
    addToast('Report exported as PDF / Excel file', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Business Analytics & Reports</h1>
          <p className="text-xs text-slate-400">Comprehensive report metrics for revenue, bookings and top technicians</p>
        </div>

        <Button onClick={handleExport} variant="primary" size="sm" icon={Download}>
          Export PDF Report
        </Button>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Daily Revenue</span>
          <span className="text-2xl font-extrabold text-white">₹{stats.todayRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+12% vs yesterday</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Weekly Revenue</span>
          <span className="text-2xl font-extrabold text-white">₹142,500</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+18% vs last week</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Monthly Revenue</span>
          <span className="text-2xl font-extrabold text-emerald-400">₹{stats.monthlyRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+22% vs last month</span>
        </div>
      </div>

      {/* Top Performing Technicians */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Top Performing Washing Technicians
        </h3>

        <div className="space-y-3">
          {INITIAL_EMPLOYEES.map((emp, i) => (
            <div key={emp.id} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-400 font-mono">#{i + 1}</span>
                <img src={emp.photo} alt={emp.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-white">{emp.name}</h4>
                  <span className="text-[10px] text-slate-400">{emp.role}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-white">{emp.completedJobs} Jobs</span>
                <span className="text-[10px] text-amber-400 block font-bold">⭐ {emp.rating} Rating</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
