import React from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_ANALYTICS_DATA } from '../../data/mockData';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const stats = ADMIN_ANALYTICS_DATA;

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-rose-400">Enterprise Administration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AquaGo Wash Control Center</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/bookings" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1">
            Manage Bookings <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 50. KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Customers</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Users className="w-4 h-4" /></div>
          </div>
          <span className="text-2xl font-extrabold text-white">{stats.totalCustomers}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+14% this month</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Technicians</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Briefcase className="w-4 h-4" /></div>
          </div>
          <span className="text-2xl font-extrabold text-white">{stats.totalEmployees} Active</span>
          <span className="text-[10px] text-slate-400 block mt-1">100% verified</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Today's Bookings</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><Calendar className="w-4 h-4" /></div>
          </div>
          <span className="text-2xl font-extrabold text-white">{stats.todayBookings}</span>
          <span className="text-[10px] text-cyan-400 block mt-1">{stats.pendingBookings} pending dispatch</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Monthly Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign className="w-4 h-4" /></div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">₹{stats.monthlyRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+22% vs last month</span>
        </div>
      </div>

      {/* 50. ANALYTICS & POPULAR SERVICES CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Visual Bar Simulation */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Revenue Growth Breakdown (₹)
            </h3>
            <span className="text-xs text-slate-400">2026 Fiscal Year</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
            {stats.revenueByMonth.map((item, i) => {
              const maxRev = 600000;
              const heightPercent = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ₹{(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-lg group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300 shadow-md"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Wash Services Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Popular Services Share
          </h3>

          <div className="space-y-3.5">
            {stats.popularServices.map((srv, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>{srv.name}</span>
                  <span className="text-cyan-400 font-extrabold">{srv.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${srv.percentage}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
