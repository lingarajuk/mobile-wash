import React from 'react';
import { useAuth } from '@shared/context/AuthContext';
import { StatusBadge } from '@shared/components/StatusBadge';
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
        <h1 className="text-2xl font-black text-[#10213F]">Payment & Settlement Management</h1>
        <p className="text-xs text-[#64748B]">Track digital transaction statuses, cash collections and refunds</p>
      </div>

      <div className="glass-card rounded-2xl border border-[#E6ECF5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]/90 text-[#334155] font-bold border-b border-[#E6ECF5]">
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
                <tr key={t.id} className="hover:bg-[#F8FAFC]/40">
                  <td className="p-3.5 font-mono text-[#334155]">{t.id}</td>
                  <td className="p-3.5 font-mono font-bold text-[#1264F5]">{t.bookingId}</td>
                  <td className="p-3.5 font-black text-[#10213F]">{t.customer}</td>
                  <td className="p-3.5 text-[#334155]">{t.method}</td>
                  <td className="p-3.5 text-[#64748B]">{t.date}</td>
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
