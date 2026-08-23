import React, { useState } from 'react';
import { INITIAL_CUSTOMERS } from '@shared/data/mockData';
import { useToast } from '@shared/context/ToastContext';
import { Search, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@shared/components/StatusBadge';

export const AdminCustomersPage = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');

  const toggleStatus = (id) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const next = c.status === 'Active' ? 'Inactive' : 'Active';
        addToast(`Customer account ${c.name} is now ${next}`, 'info');
        return { ...c, status: next };
      }
      return c;
    }));
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213F]">Customer Accounts Management</h1>
          <p className="text-xs text-[#64748B]">View customer profile history and manage account active statuses</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-[#E6ECF5]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6ECF5] text-xs text-slate-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-[#E6ECF5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]/90 text-[#334155] font-bold border-b border-[#E6ECF5]">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">City</th>
                <th className="p-3.5">Total Washes</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#F8FAFC]/40">
                  <td className="p-3.5 font-black text-[#10213F]">{c.name}</td>
                  <td className="p-3.5 text-[#334155]">{c.phone}<br/><span className="text-[10px] text-[#64748B]">{c.email}</span></td>
                  <td className="p-3.5 text-[#334155]">{c.city}</td>
                  <td className="p-3.5 font-bold text-[#1264F5]">{c.totalBookings} Washes</td>
                  <td className="p-3.5 font-extrabold text-emerald-400">₹{c.totalSpent}</td>
                  <td className="p-3.5"><StatusBadge status={c.status} /></td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                        c.status === 'Active' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
