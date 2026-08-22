import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  User,
  Phone,
  Mail,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  Bell,
  Tag,
  Gift,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Edit2,
  Crown
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'rahul.sharma@example.com');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setUser({ ...user, name, phone, email });
    setShowEditModal(false);
    addToast('Profile updated successfully!', 'success');
  };

  const menuGroups = [
    {
      title: 'Vehicle & Address Management',
      items: [
        { label: 'My Vehicles', path: '/my-vehicles', icon: Car, info: '2 vehicles saved' },
        { label: 'Saved Addresses', path: '/saved-addresses', icon: MapPin, info: 'Home, Office' },
      ]
    },
    {
      title: 'Bookings & Membership',
      items: [
        { label: 'My Bookings', path: '/bookings', icon: Calendar, info: 'Track active wash' },
        { label: 'Membership Subscription', path: '/membership', icon: Crown, info: user?.membership?.plan || 'Free Member' },
        { label: 'Offers & Coupons', path: '/offers', icon: Tag, info: 'Save up to ₹300' },
        { label: 'Refer & Earn', path: '/refer-earn', icon: Gift, info: 'Get ₹100 credit' },
      ]
    },
    {
      title: 'Account Settings & Support',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell, info: 'Manage alerts' },
        { label: 'Help & Support / FAQs', path: '/help', icon: HelpCircle, info: '24/7 assistance' },
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* 37. PROFILE HEADER */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user?.name || 'Rahul Sharma'}</h2>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{user?.email}</p>
            <p className="text-xs text-slate-400">{user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded-xl transition-colors"
          title="Edit Profile"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Groups */}
      {menuGroups.map((group, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">{group.title}</h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-cyan-400 rounded-xl border border-slate-800 group-hover:border-cyan-500/30">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.info}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Action */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full glass-card p-4 rounded-2xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Log Out of AquaGo
      </button>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile Details">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Mobile Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setShowEditModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          addToast('Logged out successfully', 'info');
          navigate('/login');
        }}
        title="Log Out of Account?"
        description="Are you sure you want to log out from AquaGo Wash?"
        confirmText="Log Out"
      />
    </div>
  );
};
