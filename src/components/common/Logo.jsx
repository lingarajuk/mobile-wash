import React from 'react';
import { Droplets, Sparkles, Car } from 'lucide-react';

export const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-xl', badge: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', badge: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', badge: 'text-sm' }
  }[size] || { icon: 'w-8 h-8', text: 'text-xl', badge: 'text-[10px]' };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl blur-md opacity-70 animate-pulse-subtle"></div>
        <div className={`relative bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50`}>
          <Droplets className={`${sizeClasses.icon} text-cyan-400 stroke-[2.2]`} />
          <Car className="w-3.5 h-3.5 text-blue-400 absolute -bottom-0.5 -right-0.5 fill-cyan-400/20" />
          <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className={`font-extrabold tracking-tight text-white ${sizeClasses.text}`}>
              Aqua<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Go</span>
            </span>
            <span className={`bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold px-1.5 py-0.5 rounded-full ${sizeClasses.badge}`}>
              WASH
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
