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
  Layers
} from 'lucide-react';

export const Navbar = () => {
  const { role, switchRole, user, logout, unreadNotifCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/'} className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        {/* Desktop Customer Navigation */}
        {role === 'customer' && (
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isActive('/') ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isActive('/services') ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Services
            </Link>
            <Link
              to="/bookings"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isActive('/bookings') ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              My Bookings
            </Link>
            <Link
              to="/offers"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isActive('/offers') ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Offers
            </Link>
            <Link
              to="/membership"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isActive('/membership') ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Membership
            </Link>
          </nav>
        )}

        {/* Admin Navigation */}
        {role === 'admin' && (
          <nav className="hidden md:flex items-center gap-1 font-medium text-xs">
            <Link to="/admin" className={`px-3 py-1.5 rounded-lg ${isActive('/admin') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Dashboard</Link>
            <Link to="/admin/bookings" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/bookings') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Bookings</Link>
            <Link to="/admin/employees" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/employees') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Employees</Link>
            <Link to="/admin/customers" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/customers') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Customers</Link>
            <Link to="/admin/services" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/services') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Services</Link>
            <Link to="/admin/offers" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/offers') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Offers</Link>
            <Link to="/admin/reports" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/reports') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Reports</Link>
            <Link to="/admin/settings" className={`px-3 py-1.5 rounded-lg ${isActive('/admin/settings') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>Settings</Link>
          </nav>
        )}

        {/* Employee Navigation */}
        {role === 'employee' && (
          <nav className="hidden md:flex items-center gap-1 font-medium text-xs">
            <Link to="/employee" className={`px-3 py-1.5 rounded-lg ${isActive('/employee') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>My Jobs</Link>
            <Link to="/employee/profile" className={`px-3 py-1.5 rounded-lg ${isActive('/employee/profile') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'}`}>My Profile & Earnings</Link>
          </nav>
        )}

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2.5">
          {/* ROLE SWITCHER DEMO DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 text-xs bg-slate-800/90 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-700 transition-colors"
              title="Switch user role for testing"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="capitalize font-semibold text-cyan-400">{role} Mode</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-1.5 text-xs">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400">Switch View Demo</div>
                <button
                  onClick={() => { switchRole('customer'); setShowRoleMenu(false); navigate('/'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left ${role === 'customer' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <User className="w-4 h-4 text-cyan-400" /> Customer Portal
                </button>
                <button
                  onClick={() => { switchRole('employee'); setShowRoleMenu(false); navigate('/employee'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left ${role === 'employee' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <Briefcase className="w-4 h-4 text-amber-400" /> Employee Portal
                </button>
                <button
                  onClick={() => { switchRole('admin'); setShowRoleMenu(false); navigate('/admin'); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left ${role === 'admin' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Admin Portal
                </button>
              </div>
            )}
          </div>

          {/* Notifications Icon (Customer) */}
          {role === 'customer' && (
            <Link
              to="/notifications"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center rounded-full">
                  {unreadNotifCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.profilePic || user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-cyan-500/40"
                />
                <span className="hidden lg:block text-xs font-semibold text-slate-200">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                  <div className="p-2.5 border-b border-slate-800">
                    <p className="font-bold text-white text-sm">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email || user.phone}</p>
                  </div>
                  
                  {role === 'customer' && (
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                        <User className="w-4 h-4 text-cyan-400" /> View Profile
                      </Link>
                      <Link to="/bookings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                        <Calendar className="w-4 h-4 text-cyan-400" /> My Bookings
                      </Link>
                      <Link to="/my-vehicles" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                        <Layers className="w-4 h-4 text-cyan-400" /> Saved Vehicles
                      </Link>
                      <Link to="/saved-addresses" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                        <MapPin className="w-4 h-4 text-cyan-400" /> Saved Addresses
                      </Link>
                      <Link to="/refer-earn" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                        <Tag className="w-4 h-4 text-amber-400" /> Refer & Earn
                      </Link>
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium"
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
              className="text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
