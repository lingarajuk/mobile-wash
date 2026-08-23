import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { Logo } from '@shared/components/Logo';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Tag,
  Calendar,
  Layers,
  MapPin,
  HelpCircle,
  Gift,
  Crown
} from 'lucide-react';

export const CustomerNavbar = () => {
  const { user, logout, unreadNotifCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6ECF5] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <Logo size="md" />
        </Link>

        {/* Desktop Customer Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 font-medium text-[14px] lg:text-[15px]">
          <Link
            to="/"
            className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/') && location.pathname === '/'
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1264F5] after:rounded-full'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/services') || isActive('/service')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1264F5] after:rounded-full'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Services
          </Link>
          <Link
            to="/my-bookings"
            className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/my-bookings') || isActive('/bookings')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1264F5] after:rounded-full'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            My Bookings
          </Link>
          <Link
            to="/offers"
            className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/offers')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1264F5] after:rounded-full'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Offers
          </Link>
          <Link
            to="/membership"
            className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/membership')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold after:content-[""] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1264F5] after:rounded-full'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Membership
          </Link>
        </nav>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Bell */}
          <Link
            to="/notifications"
            className="relative p-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-xl transition-colors border border-transparent hover:border-[#E6ECF5]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#1264F5] text-white font-bold text-[10px] flex items-center justify-center rounded-full">
                {unreadNotifCount}
              </span>
            )}
          </Link>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E6ECF5] transition-colors cursor-pointer"
              >
                <img
                  src={user.profilePic || user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E6ECF5]"
                />
                <span className="hidden sm:block text-xs font-bold text-[#10213F]">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6ECF5] rounded-2xl shadow-xl z-50 p-2 text-xs animate-fadeIn">
                  <div className="p-2.5 border-b border-[#E6ECF5]">
                    <p className="font-bold text-[#10213F] text-sm">{user.name}</p>
                    <p className="text-[#64748B] text-[11px] truncate">{user.email || user.phone}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <User className="w-4 h-4 text-[#1264F5]" /> View Profile
                    </Link>
                    <Link to="/my-bookings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Calendar className="w-4 h-4 text-[#1264F5]" /> My Bookings
                    </Link>
                    <Link to="/my-vehicles" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Layers className="w-4 h-4 text-[#1264F5]" /> Saved Vehicles
                    </Link>
                    <Link to="/saved-addresses" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <MapPin className="w-4 h-4 text-[#1264F5]" /> Saved Addresses
                    </Link>
                    <Link to="/refer-earn" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Gift className="w-4 h-4 text-[#F59E0B]" /> Refer & Earn
                    </Link>
                    <Link to="/help" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <HelpCircle className="w-4 h-4 text-[#1264F5]" /> Help & Support
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#E6ECF5]">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold bg-[#1264F5] hover:bg-[#0F52CC] text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
