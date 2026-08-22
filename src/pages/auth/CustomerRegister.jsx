import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Phone, Mail, Lock, UserPlus } from 'lucide-react';

export const CustomerRegister = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errs.phone = 'Valid 10-digit mobile number required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email address required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) errs.agreeTerms = 'You must accept the Terms & Conditions';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addToast('OTP sent! Please verify the code.', 'info');
    navigate('/verify-otp', {
      state: {
        phone: formData.phone,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" className="mb-3" />
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join AquaGo Wash for fast doorstep vehicle cleaning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            icon={User}
            error={errors.fullName}
            required
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={Phone}
            error={errors.phone}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rahul@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={Mail}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create password (min 6 chars)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={Lock}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            icon={Lock}
            error={errors.confirmPassword}
            required
          />

          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 mt-0.5"
              />
              <span>
                I agree to the <Link to="/help" className="text-cyan-400 underline">Terms & Conditions</Link> and <Link to="/help" className="text-cyan-400 underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-rose-400 mt-1">{errors.agreeTerms}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={UserPlus}
            className="shadow-lg shadow-cyan-500/25 mt-3"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Already have an account? </span>
          <Link to="/login" className="font-bold text-cyan-400 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
