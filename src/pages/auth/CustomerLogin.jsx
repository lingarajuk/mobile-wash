import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/api';
import { Phone, Lock, LogIn, ArrowRight } from 'lucide-react';

export const CustomerLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('customer123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) errs.identifier = 'Mobile number or Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.login({
        identifier: identifier.trim(),
        password,
        role: 'customer'
      });
      login('customer', res.user, res.token || res.access_token);
      addToast(`Login successful! Welcome back, ${res.user?.name || 'Customer'}.`, 'success');
      navigate('/');
    } catch (err) {
      addToast(`Login failed: ${err.message || 'Invalid credentials'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F7F9FC] text-[#10213F] relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-[#E6ECF5] rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-2xl font-black text-[#10213F]">Welcome Back</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Sign in to book doorstep vehicle wash and track service
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Mobile Number"
            type="text"
            placeholder="e.g. rahul@example.com or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={errors.identifier}
            icon={Phone}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={Lock}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#64748B] hover:text-[#10213F]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#1264F5] focus:ring-[#1264F5]"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-[#1264F5] hover:underline font-bold"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={LogIn}
            className="mt-2"
          >
            Sign In
          </Button>

          {/* Quick Demo Credentials */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF5] text-[11px] text-[#64748B] space-y-1">
            <span className="font-bold text-[#10213F] block">Quick Demo Login:</span>
            <p>Customer: <span className="font-mono text-[#1264F5]">rahul.sharma@example.com</span> / <span className="font-mono text-[#1264F5]">customer123</span></p>
          </div>

          <div className="text-center pt-4 border-t border-[#E6ECF5] text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1264F5] font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-[#94A3B8] mt-6">
        © {new Date().getFullYear()} AquaGo Wash. All rights reserved.
      </p>
    </div>
  );
};
