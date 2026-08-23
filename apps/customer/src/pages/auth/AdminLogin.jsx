import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { authService } from '@shared/services/api';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@aquago.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login({
        identifier: email.trim(),
        password,
        role: 'admin'
      });
      login('admin', res.user, res.token || res.access_token);
      addToast('Secure Admin Session Initiated.', 'success');
      navigate('/admin');
    } catch (err) {
      addToast(`Admin login failed: ${err.message || 'Invalid credentials'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-white text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <Link to="/login" className="flex items-center gap-1 text-xs text-[#64748B] hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> Customer Login
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 mb-2">
            Restricted System Access
          </span>
          <h2 className="text-2xl font-extrabold text-white">AquaGo Admin Control</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Enterprise dashboard for bookings, technicians, revenue & services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@aquago.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Master Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="danger"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold shadow-lg shadow-rose-950/40"
          >
            Authenticate & Launch Console
          </Button>
        </form>
      </div>
    </div>
  );
};
