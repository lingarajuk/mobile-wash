import React, { useState } from 'react';
import { INITIAL_EMPLOYEES } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Plus, Trash2, Edit, Star, ShieldCheck } from 'lucide-react';

export const AdminEmployeesPage = () => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Wash Specialist',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      addToast('Technician name and phone required', 'warning');
      return;
    }
    const newEmp = {
      id: `emp-${Date.now()}`,
      ...form,
      rating: 5.0,
      status: 'Available',
      completedJobs: 0
    };
    setEmployees([...employees, newEmp]);
    setShowModal(false);
    setForm({ name: '', phone: '', email: '', role: 'Wash Specialist', photo: '' });
    addToast('Technician onboarded successfully!', 'success');
  };

  const toggleEmpStatus = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Available' ? 'Inactive' : 'Available' } : e));
    addToast('Technician status toggled', 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Technicians & Employee Roster</h1>
          <p className="text-xs text-slate-400">Onboard technicians, track job completions and ratings</p>
        </div>

        <Button onClick={() => setShowModal(true)} variant="primary" size="sm" icon={Plus}>
          Add Technician
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3.5">
              <img src={emp.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'} alt={emp.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40" />
              <div>
                <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                <p className="text-xs text-slate-400">{emp.role}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {emp.rating} • {emp.completedJobs} jobs
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <StatusBadge status={emp.status} />

              <div className="flex items-center gap-2">
                <button onClick={() => toggleEmpStatus(emp.id)} className="text-xs font-bold text-slate-300 hover:text-cyan-400">
                  Toggle Status
                </button>
                <button onClick={() => setDeleteId(emp.id)} className="p-1 text-slate-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Onboard New Technician">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Technician Name" placeholder="e.g. Manjunath R" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Mobile Phone" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Email" placeholder="manju@aquago.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select label="Designation Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'Senior Detailing Technician', label: 'Senior Detailing Technician' }, { value: 'Wash Specialist', label: 'Wash Specialist' }, { value: 'Eco-Wash Technician', label: 'Eco-Wash Technician' }]} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Onboard Employee</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          setEmployees(employees.filter(e => e.id !== deleteId));
          setDeleteId(null);
          addToast('Technician removed', 'info');
        }}
        title="Remove Technician?"
        description="Are you sure you want to delete this employee record?"
        confirmText="Remove"
      />
    </div>
  );
};
