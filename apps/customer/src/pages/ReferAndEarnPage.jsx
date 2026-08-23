import React, { useState } from 'react';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { Gift, Copy, Check, Share2, Sparkles, Users } from 'lucide-react';
import { Button } from '@shared/components/Button';

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
    <div className="max-w-xl mx-auto space-y-6 pb-16 text-center animate-fadeIn">
      <div className="w-16 h-16 bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl flex items-center justify-center text-[#F59E0B] mx-auto shadow-xs">
        <Gift className="w-8 h-8" />
      </div>

      <div>
        <span className="text-xs uppercase font-bold tracking-wider bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] px-3 py-1 rounded-full">
          Referral Reward Program
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10213F] mt-2">Invite Friends, Get Free Washes</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
          Share your referral code. When your friend completes their first wash, you both get <strong>₹100 wash credits</strong> instantly!
        </p>
      </div>

      {/* Referral Code Display Box */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
        <span className="text-xs text-[#64748B] font-bold block">Your Exclusive Referral Code</span>
        
        <div className="flex items-center justify-center gap-3">
          <div className="bg-[#F8FAFC] border-2 border-[#1264F5] px-6 py-3 rounded-2xl text-2xl font-black text-[#1264F5] tracking-widest font-mono">
            {refCode}
          </div>
          
          <button
            onClick={copyCode}
            className="p-3.5 bg-[#1264F5] hover:bg-[#0F52CC] text-white rounded-2xl transition-all font-bold shadow-sm cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-5 h-5 text-white stroke-[3]" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="pt-2">
          <Button onClick={shareCode} variant="primary" fullWidth icon={Share2}>
            Share with WhatsApp / Friends
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 text-xs text-left">
        <div className="bg-white p-4 rounded-2xl border border-[#E6ECF5] shadow-xs">
          <span className="text-lg font-black text-[#1264F5] block font-mono">01</span>
          <strong className="text-[#10213F] block mt-1">Share Code</strong>
          <span className="text-[11px] text-[#64748B]">Send link to friends</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E6ECF5] shadow-xs">
          <span className="text-lg font-black text-[#1264F5] block font-mono">02</span>
          <strong className="text-[#10213F] block mt-1">Friend Books</strong>
          <span className="text-[11px] text-[#64748B]">They get ₹100 off</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E6ECF5] shadow-xs">
          <span className="text-lg font-black text-[#1264F5] block font-mono">03</span>
          <strong className="text-[#10213F] block mt-1">You Earn</strong>
          <span className="text-[11px] text-[#64748B]">₹100 in your wallet</span>
        </div>
      </div>
    </div>
  );
};
