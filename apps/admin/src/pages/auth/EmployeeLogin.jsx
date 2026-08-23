import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { Logo } from '@shared/components/Logo';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { authService } from '@shared/services/api';
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F7F9FC] text-[#10213F] relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-[#E6ECF5] rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        <Link to="/login" className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#10213F] font-bold mb-4">
          <ArrowLeft className="w-4 h-4" /> Customer Login
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-[#F0F6FF] border border-[#BFDBFE] text-[#1264F5] rounded-2xl flex items-center justify-center mb-3">
            <Briefcase className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1264F5] font-bold bg-[#F0F6FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE] mb-2">
            Technician Portal
          </span>
          <h2 className="text-2xl font-black text-[#10213F]">Employee Login</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Access assigned doorstep jobs and update work progress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Employee Email or ID"
            type="email"
            placeholder="e.g. venky@aquago.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            icon={LogIn}
            className="mt-2"
          >
            Sign In to Technician Portal
          </Button>

          {/* Quick Demo Credentials */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF5] text-[11px] text-[#64748B] space-y-1">
            <span className="font-bold text-[#10213F] block">Quick Demo Credentials:</span>
            <p>Email: <span className="font-mono text-[#1264F5]">venky@aquago.com</span></p>
            <p>Password: <span className="font-mono text-[#1264F5]">employee123</span></p>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-[#94A3B8] mt-6">
        © {new Date().getFullYear()} AquaGo Wash. All rights reserved.
      </p>
    </div>
  );
};
