import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { MapPin, Plus, Trash2, ArrowLeft, Building } from 'lucide-react';

export const SavedAddressesPage = () => {
  const navigate = useNavigate();
  const { addresses, addAddress, removeAddress } = useAuth();
  const { addToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    label: 'Home',
    house: '',
    street: '',
    area: '',
    landmark: '',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570002'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.house || !form.area) {
      addToast('House number and area are required', 'warning');
      return;
    }
    addAddress(form);
    setShowAddModal(false);
    setForm({ label: 'Home', house: '', street: '', area: '', landmark: '', city: 'Mysuru', state: 'Karnataka', pincode: '570002' });
    addToast('New address saved!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Saved Addresses</h1>
          <p className="text-xs text-slate-400">Doorstep service locations for wash technicians</p>
        </div>

        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" icon={Plus}>
          Add Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-slate-800 text-cyan-400 rounded-xl">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{addr.label}</h4>
                  {addr.isDefault && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {addr.house}, {addr.street}, {addr.area}, {addr.city} – {addr.pincode}
                </p>
                {addr.landmark && <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>}
              </div>
            </div>

            <button
              onClick={() => setDeleteId(addr.id)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Saved Address">
        <form onSubmit={handleAdd} className="space-y-3">
          <Select label="Type Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} options={[{ value: 'Home', label: 'Home' }, { value: 'Office', label: 'Office' }, { value: 'Other', label: 'Other' }]} />
          <Input label="House / Apartment / Building No." placeholder="No. 12" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} required />
          <Input label="Street Address" placeholder="Gokulam Main Rd" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <Input label="Area / Locality" placeholder="Vijayanagar" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
          <Input label="Landmark" placeholder="Near Temple" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="PIN Code" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowAddModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          removeAddress(deleteId);
          setDeleteId(null);
          addToast('Address removed', 'info');
        }}
        title="Delete Address?"
        description="Are you sure you want to delete this doorstep location?"
        confirmText="Delete"
      />
    </div>
  );
};
