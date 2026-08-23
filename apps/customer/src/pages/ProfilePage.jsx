import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { Modal } from '@shared/components/Modal';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { ConfirmDialog } from '@shared/components/ConfirmDialog';
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
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* PROFILE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1264F5]/30 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#10213F]">{user?.name || 'Rahul Sharma'}</h2>
              <span className="text-[10px] bg-[#F0F6FF] text-[#1264F5] font-extrabold px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
            <p className="text-xs text-[#94A3B8] font-mono">{user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#1264F5] rounded-xl transition-colors cursor-pointer"
          title="Edit Profile"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* MENU GROUPS */}
      <div className="space-y-4">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="bg-white rounded-3xl p-4 border border-[#E6ECF5] shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] px-3 tracking-wider block mb-1">
              {group.title}
            </span>
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={iIdx}
                  to={item.path}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#10213F] group-hover:text-[#1264F5] transition-colors block">
                        {item.label}
                      </span>
                      {item.info && (
                        <span className="text-[11px] text-[#94A3B8]">{item.info}</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1264F5] group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        ))}

        {/* LOGOUT BUTTON */}
        <div className="pt-2">
          <Button
            onClick={() => setShowLogoutConfirm(true)}
            variant="secondary"
            fullWidth
            icon={LogOut}
            className="text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#FECACA]"
          >
            Sign Out Account
          </Button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Personal Profile"
        subtitle="Update your contact details for bookings"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Mobile Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* LOGOUT CONFIRM */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Sign Out?"
        message="Are you sure you want to sign out of your AquaGo account?"
        confirmText="Sign Out"
        confirmVariant="danger"
      />
    </div>
  );
};
