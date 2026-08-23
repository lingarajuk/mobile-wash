import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { VEHICLE_CATEGORIES } from '../../data/mockData';
import { Plus, Car, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyVehiclesPage = () => {
  const navigate = useNavigate();
  const { vehicles, addVehicle, removeVehicle } = useAuth();
  const { addToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    type: 'sedan',
    brand: '',
    model: '',
    regNumber: '',
    color: ''
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.regNumber) {
      addToast('Please complete all vehicle fields', 'warning');
      return;
    }
    addVehicle(form);
    setShowAddModal(false);
    setForm({ type: 'sedan', brand: '', model: '', regNumber: '', color: '' });
    addToast('Vehicle added successfully!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#10213F] font-bold cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Saved Vehicles</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage your cars & bikes for quick 1-tap bookings</p>
        </div>

        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" icon={Plus}>
          Add Vehicle
        </Button>
      </div>

      <div className="space-y-3">
        {vehicles.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}

        {vehicles.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-[#E6ECF5] text-center space-y-3 shadow-xs">
            <Car className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h3 className="text-base font-bold text-[#10213F]">No Vehicles Saved Yet</h3>
            <p className="text-xs text-[#64748B]">Add your car or motorcycle to speed up your wash bookings.</p>
            <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" icon={Plus}>
              Add Your First Vehicle
            </Button>
          </div>
        )}
      </div>

      {/* ADD VEHICLE MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vehicle"
        subtitle="Saved to your account for doorstep bookings"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            label="Vehicle Category *"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={VEHICLE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          />
          <Input
            label="Brand / Manufacturer *"
            placeholder="e.g. Hyundai, Honda, Tata, RE"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            required
          />
          <Input
            label="Model Name *"
            placeholder="e.g. Creta SX, City ZX, Nexon EV"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            required
          />
          <Input
            label="Registration Number *"
            placeholder="e.g. KA-09-MA-7821"
            value={form.regNumber}
            onChange={(e) => setForm({ ...form, regNumber: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Body Color"
            placeholder="e.g. Polar White, Phantom Black"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          removeVehicle(deleteId);
          setDeleteId(null);
          addToast('Vehicle removed from saved list', 'info');
        }}
        title="Remove Vehicle?"
        message="Are you sure you want to remove this vehicle from your account?"
        confirmText="Remove"
        confirmVariant="danger"
      />
    </div>
  );
};
