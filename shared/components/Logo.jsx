import React from 'react';
import { Droplets, Sparkles, Car } from 'lucide-react';

export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: { icon: 'w-5 h-5', text: 'text-base', badge: 'text-[9px]' },
    md: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[10px]' },
    lg: { icon: 'w-8 h-8', text: 'text-2xl', badge: 'text-xs' },
    xl: { icon: 'w-10 h-10', text: 'text-3xl', badge: 'text-sm' }
  }[size] || { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[10px]' };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="relative bg-gradient-to-br from-[#1264F5] to-[#08BFE8] rounded-xl p-2 flex items-center justify-center text-white shadow-md shadow-[#1264F5]/20">
          <Droplets className={`${sizeClasses.icon} text-white stroke-[2.2]`} />
          <Car className="w-3 h-3 text-white/90 absolute -bottom-0.5 -right-0.5 fill-white/20" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-[#10213F] ${sizeClasses.text}`}>
              Aqua<span className="text-[#1264F5]">Go</span>
            </span>
            <span className={`bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE] font-extrabold px-1.5 py-0.5 rounded-md ${sizeClasses.badge}`}>
              WASH
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
