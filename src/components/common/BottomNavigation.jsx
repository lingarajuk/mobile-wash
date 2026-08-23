import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, Calendar, Tag, User, Briefcase, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNavigation = () => {
  const location = useLocation();
  const { role } = useAuth();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isEmployeeRoute = location.pathname.startsWith('/employee');

  const navItems = isEmployeeRoute ? [
    { label: 'Assigned Jobs', path: '/employee', icon: Briefcase },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Alerts', path: '/notifications', icon: Bell }
  ] : [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Sparkles },
    { label: 'Bookings', path: '/bookings', icon: Calendar },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E6ECF5] px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#1264F5] font-bold'
                  : 'text-[#64748B] hover:text-[#10213F]'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#F0F6FF]' : ''}`}>
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
