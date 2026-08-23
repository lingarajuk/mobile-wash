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
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#10213F] font-bold cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Saved Addresses</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Doorstep service locations for wash technicians</p>
        </div>

        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" icon={Plus}>
          Add Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white p-4.5 rounded-2xl border border-[#E6ECF5] flex items-center justify-between shadow-xs hover:border-[#BFDBFE] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#10213F]">{addr.label}</h4>
                  {addr.isDefault && (
                    <span className="text-[9px] uppercase font-mono bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] px-2 py-0.5 rounded-full font-bold">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                  {addr.house}, {addr.street ? `${addr.street}, ` : ''}{addr.area}, {addr.city} – {addr.pincode}
                </p>
                {addr.landmark && (
                  <span className="text-[11px] text-[#94A3B8]">Landmark: {addr.landmark}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeleteId(addr.id)}
              className="p-2 text-[#94A3B8] hover:text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              title="Delete Address"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-[#E6ECF5] text-center space-y-3 shadow-xs">
            <Building className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h3 className="text-base font-bold text-[#10213F]">No Saved Addresses</h3>
            <p className="text-xs text-[#64748B]">Add your home or office address for easy doorstep washing.</p>
            <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" icon={Plus}>
              Add Address
            </Button>
          </div>
        )}
      </div>

      {/* ADD ADDRESS MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Doorstep Service Address"
        subtitle="Where should our water-equipped wash specialist arrive?"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            label="Address Type *"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            options={[
              { value: 'Home', label: 'Home 🏠' },
              { value: 'Office', label: 'Office 🏢' },
              { value: 'Other', label: 'Other 📍' }
            ]}
          />
          <Input
            label="Flat / House / Villa Number *"
            placeholder="e.g. Flat 302, Green Meadows"
            value={form.house}
            onChange={(e) => setForm({ ...form, house: e.target.value })}
            required
          />
          <Input
            label="Street / Main Road"
            placeholder="e.g. 5th Main Road"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          <Input
            label="Area / Locality *"
            placeholder="e.g. Saraswathipuram, Jayalakshmipuram"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            required
          />
          <Input
            label="Landmark (Optional)"
            placeholder="e.g. Near Big Bazaar"
            value={form.landmark}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="PIN Code"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          removeAddress(deleteId);
          setDeleteId(null);
          addToast('Address removed', 'info');
        }}
        title="Remove Address?"
        message="Are you sure you want to remove this saved address?"
        confirmText="Remove"
        confirmVariant="danger"
      />
    </div>
  );
};
