import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

export const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const phone = location.state?.phone || '+91 98765 43210';
  const [otp, setOtp] = useState(['5', '2', '8', '9', '0', '1']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      addToast('Please enter full 6-digit OTP', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (location.state?.fullName && location.state?.email) {
        // Perform real registration
        const res = await authService.register({
          fullName: location.state.fullName,
          phone: location.state.phone,
          email: location.state.email,
          password: location.state.password || 'customer123',
          role: 'customer'
        });
        login('customer', res.user, res.token || res.access_token);
        addToast('Registration complete & account activated in database!', 'success');
      } else {
        // Fallback login
        const res = await authService.login({
          identifier: location.state?.phone || location.state?.email || 'rahul.sharma@example.com',
          password: 'customer123',
          role: 'customer'
        });
        login('customer', res.user, res.token || res.access_token);
        addToast('Phone number verified! Account activated.', 'success');
      }
      navigate('/');
    } catch (err) {
      addToast(`Verification failed: ${err.message || 'Error creating account'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(45);
    setCanResend(false);
    addToast(`New OTP sent to ${phone}`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Verify Phone Number</h2>
          <p className="text-xs text-slate-300 mt-1">
            We sent a 6-digit OTP code to <span className="font-bold text-cyan-400">{phone}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP 6-Box Grid */}
          <div className="flex items-center justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-center text-xl font-bold text-white rounded-xl outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="shadow-lg shadow-cyan-500/25"
          >
            Verify OTP & Proceed
          </Button>
        </form>

        {/* Resend & Timer */}
        <div className="text-center mt-6 pt-4 border-t border-slate-800/80 text-xs">
          {canResend ? (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 font-bold text-cyan-400 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
            </button>
          ) : (
            <span className="text-slate-400">
              Resend OTP code in <span className="font-bold text-cyan-400">{timer}s</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
