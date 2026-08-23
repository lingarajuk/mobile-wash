import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { Logo } from '@shared/components/Logo';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F7F9FC] text-[#10213F] relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-[#E6ECF5] rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" className="mb-3" />
          <h2 className="text-2xl font-black text-[#10213F]">Create Account</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Join AquaGo Wash for fast doorstep vehicle detailing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            icon={User}
            required
          />

          <Input
            label="Mobile Number *"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            icon={Phone}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. rahul@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            icon={Mail}
            required
          />

          <Input
            label="Create Password *"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            icon={Lock}
            required
          />

          <Input
            label="Confirm Password *"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            icon={Lock}
            required
          />

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-[#64748B]">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded border-[#CBD5E1] text-[#1264F5] focus:ring-[#1264F5]"
              />
              <span>
                I agree to AquaGo's{' '}
                <a href="#terms" className="text-[#1264F5] hover:underline font-bold">Terms of Service</a> &{' '}
                <a href="#privacy" className="text-[#1264F5] hover:underline font-bold">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeTerms && (
              <span className="text-xs text-[#EF4444] font-medium block mt-1">{errors.agreeTerms}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            icon={UserPlus}
            className="mt-2"
          >
            Create Account & Verify OTP
          </Button>

          <div className="text-center pt-4 border-t border-[#E6ECF5] text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1264F5] font-bold hover:underline">
              Sign In
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
