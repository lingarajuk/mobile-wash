import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, Lock, Headphones, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-[#E6ECF5] mt-auto">
      {/* Top Trust Indicators Strip */}
      <div className="border-b border-[#E6ECF5] py-4 bg-[#F8FAFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#10213F]">Secure Payments</h4>
                <p className="text-[11px] text-[#64748B]">100% encrypted & verified transactions</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#10213F]">Privacy Protected</h4>
                <p className="text-[11px] text-[#64748B]">Your vehicle & personal data is safe</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#10213F]">24/7 Dedicated Support</h4>
                <p className="text-[11px] text-[#64748B]">Instant help for all washing bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Logo & Tagline */}
          <div className="space-y-1.5">
            <Logo size="md" />
            <p className="text-xs text-[#64748B] max-w-sm">
              India's premier eco-friendly mobile vehicle wash & detailing platform at your doorstep.
            </p>
          </div>

          {/* Useful Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#64748B]">
            <Link to="/services" className="hover:text-[#1264F5] transition-colors">Services</Link>
            <Link to="/membership" className="hover:text-[#1264F5] transition-colors">Membership</Link>
            <Link to="/offers" className="hover:text-[#1264F5] transition-colors">Offers</Link>
            <Link to="/help" className="hover:text-[#1264F5] transition-colors">Help & Support</Link>
            <Link to="/help" className="hover:text-[#1264F5] transition-colors">Privacy Policy</Link>
            <Link to="/help" className="hover:text-[#1264F5] transition-colors">Terms of Service</Link>
          </div>

          {/* Social Links & Copyright */}
          <div className="space-y-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-3 text-[#64748B]">
              <a href="#twitter" className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E6ECF5] flex items-center justify-center hover:text-[#1264F5] hover:border-[#1264F5] transition-colors text-xs font-bold">𝕏</a>
              <a href="#instagram" className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E6ECF5] flex items-center justify-center hover:text-[#1264F5] hover:border-[#1264F5] transition-colors text-xs font-bold">IG</a>
              <a href="#linkedin" className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E6ECF5] flex items-center justify-center hover:text-[#1264F5] hover:border-[#1264F5] transition-colors text-xs font-bold">in</a>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              © 2026 AquaGo Wash. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
