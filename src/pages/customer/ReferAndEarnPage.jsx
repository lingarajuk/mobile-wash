import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Gift, Copy, Check, Share2, Sparkles, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ReferAndEarnPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const refCode = user?.referralCode || 'RAHUL884';

  const copyCode = () => {
    navigator.clipboard?.writeText(refCode);
    setCopied(true);
    addToast('Referral code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AquaGo Doorstep Wash',
        text: `Use my code ${refCode} to get ₹100 OFF your first doorstep vehicle wash with AquaGo Wash!`,
        url: window.location.origin
      }).catch(() => {});
    } else {
      copyCode();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 rounded-3xl flex items-center justify-center text-amber-400 mx-auto shadow-xl">
        <Gift className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
          Referral Reward Program
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Invite Friends, Get Free Washes</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
          Share your referral code. When your friend completes their first wash, you both get <strong>₹100 wash credits</strong> instantly!
        </p>
      </div>

      {/* Referral Code Display Box */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <span className="text-xs text-slate-400 font-semibold block">Your Exclusive Referral Code</span>
        
        <div className="flex items-center justify-center gap-3">
          <div className="bg-slate-900 border-2 border-cyan-500/50 px-6 py-3 rounded-2xl text-2xl font-extrabold text-cyan-400 tracking-widest font-mono">
            {refCode}
          </div>
          
          <button
            onClick={copyCode}
            className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl transition-all font-bold shadow-lg shadow-cyan-950/40"
            title="Copy Referral Code"
          >
            {copied ? <Check className="w-6 h-6 stroke-[3]" /> : <Copy className="w-6 h-6 stroke-[2.5]" />}
          </button>
        </div>

        <div className="pt-2">
          <Button onClick={shareCode} variant="primary" size="lg" icon={Share2} fullWidth className="shadow-lg shadow-cyan-500/25">
            Share Code With Friends
          </Button>
        </div>
      </div>

      {/* Referral Progress Tracker */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-left space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" /> Your Referral Stats
        </h4>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-2xl font-extrabold text-white">3</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Friends Joined</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-2xl font-extrabold text-emerald-400">₹300</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Credits Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
};
