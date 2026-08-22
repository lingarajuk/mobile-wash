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
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Saved Vehicles</h1>
          <p className="text-xs text-slate-400">Manage your cars & bikes for quick 1-tap bookings</p>
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
            isSelected={false}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Vehicle">
        <form onSubmit={handleAdd} className="space-y-3">
          <Select
            label="Vehicle Category"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={VEHICLE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          />
          <Input label="Brand / Make" placeholder="e.g. Hyundai" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
          <Input label="Model" placeholder="e.g. Creta SX" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
          <Input label="Registration Number" placeholder="e.g. KA-09-MA-7821" value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} required />
          <Input label="Vehicle Color" placeholder="e.g. Titan Grey" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowAddModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Add Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          removeVehicle(deleteId);
          setDeleteId(null);
          addToast('Vehicle removed', 'info');
        }}
        title="Delete Vehicle?"
        description="Are you sure you want to remove this vehicle from your profile?"
        confirmText="Delete"
      />
    </div>
  );
};
