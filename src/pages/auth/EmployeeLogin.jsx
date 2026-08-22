import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/api';
import { Briefcase, Lock, LogIn, ArrowLeft } from 'lucide-react';

export const EmployeeLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('venky@aquago.com');
  const [password, setPassword] = useState('employee123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login({
        identifier: email.trim(),
        password,
        role: 'employee'
      });
      login('employee', res.user, res.token || res.access_token);
      addToast(`Welcome back, ${res.user?.name || 'Technician'}! Redirecting to Employee Portal...`, 'success');
      navigate('/employee');
    } catch (err) {
      addToast(`Employee login failed: ${err.message || 'Invalid credentials'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <Link to="/login" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> Customer Login
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-3">
            <Briefcase className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-2">
            Technician & Partner Portal
          </span>
          <h2 className="text-2xl font-extrabold text-white">Employee Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access assigned doorstep jobs and upload before/after wash photos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Employee ID / Email"
            type="email"
            placeholder="venky.wash@aquago.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Briefcase}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
          >
            Access Technician Portal
          </Button>
        </form>
      </div>
    </div>
  );
};
