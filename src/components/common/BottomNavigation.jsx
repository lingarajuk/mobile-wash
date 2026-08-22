import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, Calendar, Tag, User } from 'lucide-react';

export const BottomNavigation = () => {
  const location = useLocation();

  // Hide bottom nav on admin & employee routes if needed, or keep for mobile customers
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee')) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Sparkles },
    { label: 'Bookings', path: '/bookings', icon: Calendar },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel bg-slate-950/90 border-t border-slate-800/90 px-2 py-1.5 pb-safe shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-cyan-500/15 border border-cyan-500/30' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
