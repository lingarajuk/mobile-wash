import React, { useState } from 'react';
import { INITIAL_COUPONS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Plus, Trash2, Tag } from 'lucide-react';

export const AdminOffersPage = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount: '',
    description: '',
    expiry: '2026-12-31'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code || !form.discount) {
      addToast('Coupon code and discount amount required', 'warning');
      return;
    }
    const newC = {
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      type: 'flat',
      minSpend: 300,
      description: form.description,
      expiry: form.expiry
    };
    setCoupons([...coupons, newC]);
    setShowModal(false);
    setForm({ code: '', discount: '', description: '', expiry: '2026-12-31' });
    addToast('New coupon code created!', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Coupons & Offer Management</h1>
          <p className="text-xs text-slate-400">Configure promotional discount codes</p>
        </div>

        <Button onClick={() => setShowModal(true)} variant="primary" size="sm" icon={Plus}>
          Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-cyan-400 text-lg">{c.code}</span>
                <span className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  {c.type === 'flat' ? `₹${c.discount} OFF` : `${c.discount}% OFF`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{c.description}</p>
              <span className="text-[10px] text-slate-500 block mt-1">Valid Till: {c.expiry}</span>
            </div>

            <button
              onClick={() => {
                setCoupons(coupons.filter((_, idx) => idx !== i));
                addToast('Coupon code removed', 'info');
              }}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Coupon Code">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Coupon Code" placeholder="e.g. MONSOON30" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input label="Discount Amount (Flat ₹)" type="number" placeholder="150" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} required />
          <Input label="Description" placeholder="Flat ₹150 discount on wash..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Expiry Date" type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
