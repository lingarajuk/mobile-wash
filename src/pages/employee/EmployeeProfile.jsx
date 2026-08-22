import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Star, ShieldCheck, Briefcase, DollarSign, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeProfile = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState('Available');

  const toggleAvailability = () => {
    const next = availability === 'Available' ? 'Offline' : 'Available';
    setAvailability(next);
    addToast(`Technician availability toggled to: ${next}`, 'info');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/30 text-center space-y-3">
        <img
          src={user?.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'}
          alt={user?.name}
          className="w-24 h-24 rounded-3xl object-cover border-4 border-amber-500/40 mx-auto shadow-xl"
        />

        <div>
          <h2 className="text-2xl font-extrabold text-white">{user?.name || 'Venkatesh Kumar'}</h2>
          <p className="text-xs text-slate-400">Senior Detailing Technician • AquaGo Mysuru</p>
        </div>

        {/* Availability Toggle Button */}
        <div className="pt-2">
          <button
            onClick={toggleAvailability}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              availability === 'Available'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${availability === 'Available' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            Status: {availability} (Tap to Change)
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <Star className="w-5 h-5 text-amber-400 mx-auto mb-1 fill-amber-400" />
          <span className="text-xl font-extrabold text-white">4.9</span>
          <span className="text-[10px] text-slate-400 block font-semibold">User Rating</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <Briefcase className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <span className="text-xl font-extrabold text-white">184</span>
          <span className="text-[10px] text-slate-400 block font-semibold">Jobs Completed</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xl font-extrabold text-emerald-400">₹38.2K</span>
          <span className="text-[10px] text-slate-400 block font-semibold">Total Earnings</span>
        </div>
      </div>

      <Button
        onClick={() => {
          logout();
          addToast('Logged out of employee session', 'info');
          navigate('/login');
        }}
        variant="danger"
        fullWidth
        icon={LogOut}
      >
        Sign Out Technician Session
      </Button>
    </div>
  );
};
