import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Phone, Lock, KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [identifier, setIdentifier] = useState('rahul.sharma@example.com');
  const [otp, setOtp] = useState('528901');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      addToast('Please enter your mobile or email', 'warning');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast(`Reset OTP code sent to ${identifier}`, 'info');
      setStep(2);
    }, 500);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast('Password reset successfully! Please login with new password.', 'success');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <Link to="/login" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {step === 1
              ? 'Enter registered phone or email to receive reset code'
              : 'Enter verification OTP and your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Mobile Number / Email"
              type="text"
              placeholder="e.g. 9876543210 or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={Phone}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-lg shadow-cyan-500/25"
            >
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="6-Digit OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="528901"
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-lg shadow-cyan-500/25"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
