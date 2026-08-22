import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CreditCard, DollarSign } from 'lucide-react';

export const AdminPaymentsPage = () => {
  const { bookings } = useAuth();

  const transactions = bookings.map((b) => ({
    id: `TXN-${b.id.replace('AGW-', '')}`,
    bookingId: b.id,
    customer: 'Rahul Sharma',
    amount: b.finalAmount,
    method: b.paymentMethod,
    status: b.paymentStatus,
    date: b.date
  }));

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Payment & Settlement Management</h1>
        <p className="text-xs text-slate-400">Track digital transaction statuses, cash collections and refunds</p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-800">
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Booking Reference</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono text-slate-300">{t.id}</td>
                  <td className="p-3.5 font-mono font-bold text-cyan-400">{t.bookingId}</td>
                  <td className="p-3.5 font-bold text-white">{t.customer}</td>
                  <td className="p-3.5 text-slate-300">{t.method}</td>
                  <td className="p-3.5 text-slate-400">{t.date}</td>
                  <td className="p-3.5 font-extrabold text-emerald-400">₹{t.amount}</td>
                  <td className="p-3.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
