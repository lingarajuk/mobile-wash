import React from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_ANALYTICS_DATA } from '@shared/data/mockData';
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
    <div className="space-y-6 pb-16 text-[#10213F]">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono font-black tracking-widest text-[#EF4444] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
            Enterprise Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F] mt-1.5">
            AquaGo Wash Control Center 📊
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-semibold mt-1">
            Real-time analytics, revenue breakdowns, popular doorstep packages, and mobile dispatch health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/bookings"
            className="bg-[#1264F5] hover:bg-[#0F52CC] text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            Manage Bookings <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Total Customers</span>
            <div className="p-2 bg-[#F0F6FF] text-[#1264F5] rounded-xl"><Users className="w-4 h-4" /></div>
          </div>
          <span className="text-3xl font-black text-[#10213F] font-mono">{stats.totalCustomers}</span>
          <span className="text-[11px] text-[#16A34A] font-bold block mt-1">+14% this month</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Technicians</span>
            <div className="p-2 bg-[#FFFBEB] text-[#F59E0B] rounded-xl"><Briefcase className="w-4 h-4" /></div>
          </div>
          <span className="text-3xl font-black text-[#10213F] font-mono">{stats.totalEmployees} Active</span>
          <span className="text-[11px] text-[#475569] font-bold block mt-1">100% verified</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Today's Bookings</span>
            <div className="p-2 bg-[#F0F6FF] text-[#1264F5] rounded-xl"><Calendar className="w-4 h-4" /></div>
          </div>
          <span className="text-3xl font-black text-[#10213F] font-mono">{stats.todayBookings}</span>
          <span className="text-[11px] text-[#1264F5] font-bold block mt-1">{stats.pendingBookings} pending dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Monthly Revenue</span>
            <div className="p-2 bg-[#F0FDF4] text-[#16A34A] rounded-xl"><DollarSign className="w-4 h-4" /></div>
          </div>
          <span className="text-3xl font-black text-[#10213F] font-mono">₹{stats.monthlyRevenue.toLocaleString()}</span>
          <span className="text-[11px] text-[#16A34A] font-bold block mt-1">+22% vs last month</span>
        </div>
      </div>

      {/* ANALYTICS & POPULAR SERVICES CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Visual Bar Simulation */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#10213F] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1264F5]" /> Revenue Growth Breakdown (₹)
            </h3>
            <span className="text-xs text-[#475569] font-bold">2026 Fiscal Year</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#E6ECF5]">
            {stats.revenueByMonth.map((item, i) => {
              const maxRev = 600000;
              const heightPercent = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-[#1264F5] font-black">
                    ₹{(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#1264F5] hover:bg-[#0F52CC] rounded-t-xl transition-all duration-300 shadow-xs"
                  />
                  <span className="text-[10px] font-bold text-[#475569]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Wash Packages */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#10213F] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" /> Popular Packages
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {stats.popularServices.map((srv, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-black text-[#10213F]">
                  <span>{srv.name}</span>
                  <span className="text-[#1264F5] font-mono">{srv.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${srv.percentage}%` }}
                    className="h-full bg-[#1264F5] rounded-full"
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
