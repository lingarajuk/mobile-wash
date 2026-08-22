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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to book and manage doorstep vehicle washes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mobile Number / Email"
            type="text"
            placeholder="e.g. 9876543210 or name@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={Phone}
            error={errors.identifier}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            error={errors.password}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="font-semibold text-cyan-400 hover:underline">
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
            className="shadow-lg shadow-cyan-500/25 mt-2"
          >
            Login to Account
          </Button>

          {/* Social login divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold absolute">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              login('customer', { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' });
              addToast('Google Sign-In successful!', 'success');
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Don't have an account? </span>
          <Link to="/register" className="font-bold text-cyan-400 hover:underline">
            Create Account
          </Link>
        </div>

        {/* Quick Portal Switcher links for easy navigation */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-slate-500 border-t border-slate-800/50 pt-3">
          <Link to="/employee/login" className="hover:text-amber-400">Employee Login</Link>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-rose-400">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
};
