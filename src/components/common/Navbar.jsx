import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  Bell,
  User,
  ShieldAlert,
  Briefcase,
  MapPin,
  LogOut,
  ChevronDown,
  Sparkles,
  Tag,
  Calendar,
  Layers,
  Home,
  Crown
} from 'lucide-react';

export const Navbar = () => {
  const { role, switchRole, user, logout, unreadNotifCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6ECF5] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to={role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/'} className="flex items-center shrink-0">
          <Logo size="md" />
        </Link>

        {/* Desktop Customer Navigation */}
        {role === 'customer' && (
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
              to="/bookings"
              className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 ${
                isActive('/bookings') || isActive('/my-bookings')
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
        )}

        {/* Admin Navigation */}
        {role === 'admin' && (
          <nav className="hidden md:flex items-center gap-1 font-medium text-xs">
            <Link to="/admin" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Dashboard</Link>
            <Link to="/admin/bookings" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/bookings') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Bookings</Link>
            <Link to="/admin/employees" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/employees') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Employees</Link>
            <Link to="/admin/customers" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/customers') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Customers</Link>
            <Link to="/admin/services" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/services') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Services</Link>
            <Link to="/admin/offers" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/offers') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Offers</Link>
            <Link to="/admin/reports" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/reports') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Reports</Link>
            <Link to="/admin/settings" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname.startsWith('/admin/settings') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Settings</Link>
          </nav>
        )}

        {/* Employee Navigation */}
        {role === 'employee' && (
          <nav className="hidden md:flex items-center gap-1.5 font-medium text-sm">
            <Link to="/employee" className={`px-3.5 py-2 rounded-xl transition-colors ${location.pathname === '/employee' || location.pathname.startsWith('/employee/jobs') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>Assigned Jobs</Link>
            <Link to="/employee/profile" className={`px-3.5 py-2 rounded-xl transition-colors ${location.pathname.startsWith('/employee/profile') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'}`}>My Profile & Earnings</Link>
          </nav>
        )}

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* ROLE SWITCHER DEMO DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 text-xs bg-[#F8FAFC] border border-[#E6ECF5] text-[#10213F] px-2.5 py-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Switch user role for testing"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span className="capitalize font-bold text-[#1264F5]">{role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E6ECF5] rounded-xl shadow-xl z-50 p-1.5 text-xs animate-fadeIn">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[#94A3B8]">Switch Portal View</div>
                <button
                  onClick={() => { switchRole('customer'); setShowRoleMenu(false); navigate('/'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${role === 'customer' ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#10213F]'}`}
                >
                  <User className="w-4 h-4 text-[#1264F5]" /> Customer Portal
                </button>
                <button
                  onClick={() => { switchRole('employee'); setShowRoleMenu(false); navigate('/employee'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${role === 'employee' ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#10213F]'}`}
                >
                  <Briefcase className="w-4 h-4 text-[#F59E0B]" /> Technician Portal
                </button>
                <button
                  onClick={() => { switchRole('admin'); setShowRoleMenu(false); navigate('/admin'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${role === 'admin' ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#10213F]'}`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" /> Admin Portal
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell (Customer) */}
          {role === 'customer' && (
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
          )}

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
                  
                  {role === 'customer' && (
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                        <User className="w-4 h-4 text-[#1264F5]" /> View Profile
                      </Link>
                      <Link to="/bookings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                        <Calendar className="w-4 h-4 text-[#1264F5]" /> My Bookings
                      </Link>
                      <Link to="/my-vehicles" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                        <Layers className="w-4 h-4 text-[#1264F5]" /> Saved Vehicles
                      </Link>
                      <Link to="/saved-addresses" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                        <MapPin className="w-4 h-4 text-[#1264F5]" /> Saved Addresses
                      </Link>
                      <Link to="/refer-earn" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                        <Tag className="w-4 h-4 text-[#F59E0B]" /> Refer & Earn
                      </Link>
                    </div>
                  )}

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
              Login
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
