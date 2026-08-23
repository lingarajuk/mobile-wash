import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { Logo } from '@shared/components/Logo';
import {
  Briefcase,
  User,
  LogOut,
  ChevronDown,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const WorkerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    if (path === '/' || path === '/jobs') return location.pathname === '/' || location.pathname.startsWith('/jobs') || location.pathname.startsWith('/employee');
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E6ECF5] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        
        {/* Brand Logo & Portal Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <span className="hidden sm:inline-flex text-[10px] font-mono uppercase font-black text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
            Worker Portal
          </span>
        </div>

        {/* Worker Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 font-medium text-[14px]">
          <Link
            to="/jobs"
            className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
              isActive('/jobs') && !location.pathname.startsWith('/profile')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            Assigned Jobs
          </Link>
          <Link
            to="/profile"
            className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
              location.pathname.startsWith('/profile')
                ? 'bg-[#F0F6FF] text-[#1264F5] font-bold'
                : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
            }`}
          >
            My Profile & Earnings
          </Link>
        </nav>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs font-bold text-[#15803D]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span>🟢 Available</span>
          </div>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E6ECF5] transition-colors cursor-pointer"
              >
                <img
                  src={user.photo || user.profilePic || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E6ECF5]"
                />
                <span className="hidden sm:block text-xs font-bold text-[#10213F]">{user.name || 'Venkatesh Kumar'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6ECF5] rounded-2xl shadow-xl z-50 p-2 text-xs animate-fadeIn">
                  <div className="p-2.5 border-b border-[#E6ECF5]">
                    <p className="font-bold text-[#10213F] text-sm">{user.name || 'Venkatesh Kumar'}</p>
                    <p className="text-[#64748B] text-[11px] truncate">{user.email || 'venky@aquago.com'}</p>
                    <span className="text-[10px] text-[#1264F5] font-mono font-bold mt-1 block">Technician ID: {user.employeeId || 'emp-201'}</span>
                  </div>
                  
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <User className="w-4 h-4 text-[#1264F5]" /> View Profile & Stats
                    </Link>
                    <Link to="/jobs" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC] rounded-lg font-medium">
                      <Briefcase className="w-4 h-4 text-[#1264F5]" /> Assigned Jobs
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
