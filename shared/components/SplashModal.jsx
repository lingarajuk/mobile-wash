import React, { useEffect } from 'react';
import { Logo } from './Logo';

export const SplashModal = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white animate-fadeIn">
      <div className="w-full flex justify-end">
        <span className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-widest border border-cyan-500/20 px-2 py-0.5 rounded-full">v1.0 Pro</span>
      </div>

      <div className="flex flex-col items-center text-center my-auto transform transition-all duration-700">
        <div className="mb-6 transform scale-125">
          <Logo size="xl" showText={false} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Aqua<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Go</span> Wash
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xs leading-relaxed">
          Professional Vehicle Care at Your Doorstep
        </p>

        {/* Subtle modern loading bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden relative border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 rounded-full animate-pulse w-full"></div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">Powered by AquaGo Eco-Clean Tech</p>
      </div>
    </div>
  );
};
