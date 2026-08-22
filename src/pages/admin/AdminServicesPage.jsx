import React, { useState } from 'react';
import { INITIAL_SERVICES, VEHICLE_CATEGORIES } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Trash2, Edit, Sparkles } from 'lucide-react';

export const AdminServicesPage = () => {
  const { addToast } = useToast();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'hatchback',
    price: '',
    duration: '45 mins',
    description: '',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      addToast('Service name and price required', 'warning');
      return;
    }
    const newSrv = {
      id: `srv-${Date.now()}`,
      name: form.name,
      category: form.category,
      price: Number(form.price),
      duration: form.duration,
      description: form.description,
      image: form.image,
      rating: 5.0,
      reviewsCount: 1,
      included: ['Doorstep pressure wash', 'Microfiber dry'],
      notIncluded: []
    };
    setServices([...services, newSrv]);
    setShowModal(false);
    setForm({ name: '', category: 'hatchback', price: '', duration: '45 mins', description: '', image: '' });
    addToast('New wash service created!', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Washing Service Management</h1>
          <p className="text-xs text-slate-400">Configure wash packages, pricing and durations</p>
        </div>

        <Button onClick={() => setShowModal(true)} variant="primary" size="sm" icon={Plus}>
          Add Washing Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div key={srv.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-base font-bold text-white">{srv.name}</h4>
                <span className="text-cyan-400 font-extrabold text-sm">₹{srv.price}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">{srv.description}</p>
              <span className="text-[10px] text-slate-500 block mt-2">Duration: {srv.duration}</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setServices(services.filter(s => s.id !== srv.id));
                  addToast('Service package deleted', 'info');
                }}
                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Wash Service Package">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Service Name" placeholder="e.g. Ultra Foam Detail" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={VEHICLE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))} />
          <Input label="Price (₹)" type="number" placeholder="499" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Estimated Duration" placeholder="45 mins" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          <Input label="Short Description" placeholder="Full exterior pressure wash..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Create Service</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
