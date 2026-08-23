import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { Logo } from '@shared/components/Logo';
import {
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Calendar,
  Users,
  DollarSign,
  BarChart2,
  Settings,
  Tag,
  Briefcase
} from 'lucide-react';

export const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    if (path === '/' || path === '/dashboard' || path === '/admin') {
      return location.pathname === '/' || location.pathname === '/admin' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path) || location.pathname.startsWith(`/admin${path}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6ECF5] shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <span className="hidden sm:inline-flex text-[10px] font-mono uppercase font-black text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
        </div>

        {/* Admin Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-semibold text-xs text-[#64748B]">
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/dashboard') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/bookings"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/bookings') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Bookings
          </Link>
          <Link
            to="/employees"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/employees') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Employees
          </Link>
          <Link
            to="/customers"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/customers') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Customers
          </Link>
          <Link
            to="/services"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/services') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Services
          </Link>
          <Link
            to="/offers"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/offers') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Offers
          </Link>
          <Link
            to="/payments"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/payments') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Payments
          </Link>
          <Link
            to="/reports"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/reports') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Reports
          </Link>
          <Link
            to="/settings"
            className={`px-3 py-2 rounded-xl transition-colors ${
              isActive('/settings') ? 'bg-[#F0F6FF] text-[#1264F5] font-bold' : 'hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Settings
          </Link>
        </nav>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs font-bold text-[#DC2626]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
            <span>🛡️ Root Admin</span>
          </div>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E6ECF5] transition-colors cursor-pointer"
              >
                <img
                  src={user.profilePic || user.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E6ECF5]"
                />
                <span className="hidden sm:block text-xs font-bold text-[#10213F]">{user.name || 'Admin Master'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6ECF5] rounded-2xl shadow-xl z-50 p-2 text-xs animate-fadeIn">
                  <div className="p-2.5 border-b border-[#E6ECF5]">
                    <p className="font-bold text-[#10213F] text-sm">{user.name || 'Admin Master'}</p>
                    <p className="text-[#64748B] text-[11px] truncate">{user.email || 'admin@aquago.com'}</p>
                    <span className="text-[10px] text-[#EF4444] font-mono font-bold mt-1 block">Role: SUPER_ADMIN</span>
                  </div>
                  
                  <div className="py-1">
                    <Link to="/bookings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Calendar className="w-4 h-4 text-[#1264F5]" /> Manage Bookings
                    </Link>
                    <Link to="/employees" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Briefcase className="w-4 h-4 text-[#1264F5]" /> Manage Employees
                    </Link>
                    <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Settings className="w-4 h-4 text-[#64748B]" /> System Settings
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
