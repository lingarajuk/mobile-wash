import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Star,
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign,
  LogOut,
  Edit3,
  RefreshCw,
  Sparkles,
  Layers,
  Wrench,
  ThumbsUp,
  Activity,
  History,
  CheckCheck,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const EmployeeProfile = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | history | reviews

  // History date filter
  const [historyFilter, setHistoryFilter] = useState('all'); // all | today | week | month
  const [historyJobs, setHistoryJobs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    photo: '',
    skills: '',
    experience: '',
    bio: '',
    status: 'Available',
    location: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfile = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    employeeService.getProfile()
      .then((data) => {
        if (data && data.id) {
          setProfile(data);
          setEditForm({
            name: data.name || '',
            phone: data.phone || '',
            photo: data.photo || '',
            skills: data.skills || '',
            experience: data.experience || '',
            bio: data.bio || '',
            status: data.currentAvailability || 'Available',
            location: data.location || ''
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load profile:', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const fetchHistory = (filter = 'all') => {
    setLoadingHistory(true);
    employeeService.getHistory(filter)
      .then((data) => {
        if (Array.isArray(data)) {
          setHistoryJobs(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch job history:', err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory(historyFilter);
    }
  }, [activeTab, historyFilter]);

  const handleToggleAvailability = async () => {
    const newStatus = (profile?.currentAvailability || profile?.status) === 'Available' ? 'On Leave' : 'Available';
    try {
      await employeeService.updateAvailability(newStatus);
      setProfile(prev => ({ ...prev, currentAvailability: newStatus, status: newStatus }));
      addToast(`Status updated to: ${newStatus}`, 'success');
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await employeeService.updateProfile(editForm);
      setProfile(updated);
      addToast('Profile updated successfully!', 'success');
      setShowEditModal(false);
    } catch (err) {
      addToast(`Profile update failed: ${err.message}`, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  const p = profile || {
    id: 'emp-201',
    name: user?.name || 'Venkatesh Kumar',
    email: user?.email || 'venky@aquago.com',
    phone: user?.phone || '+91 91234 56789',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    role: 'Senior Detailing Technician',
    designation: 'Wash Specialist',
    skills: 'Pressure Foam Wash, Interior Detailing, Paint Protection, Wheel Care',
    experience: '3.5 Years',
    bio: 'Certified detailing specialist with expertise in mobile pressure foam wash, steam sanitization, and paint gloss restoration.',
    joiningDate: 'Jan 2026',
    currentAvailability: 'Available',
    rating: 4.9,
    completedJobs: 184,
    activeJobs: 1,
    upcomingJobs: 2,
    totalAssigned: 187,
    cancelledJobs: 0,
    onTimeRate: 98.5,
    todayEarnings: 1450.00,
    totalEarnings: 38200.00,
    location: 'Saraswathipuram, Mysuru',
    reviews: []
  };

  const isAvailable = (p.currentAvailability || p.status) === 'Available';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* 1. HERO WORKER CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6ECF5] shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={p.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'}
              alt={p.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#BFDBFE] shadow-sm"
            />
            <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ring-4 ring-white ${isAvailable ? 'bg-[#16A34A] animate-pulse' : 'bg-[#94A3B8]'}`} />
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                Employee ID: {p.employeeId || p.id}
              </span>
              <span className="text-[10px] font-mono uppercase font-bold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                {p.role || 'Senior Technician'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">{p.name}</h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">{p.bio}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#64748B] pt-1 font-medium">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#1264F5]" /> <strong className="text-[#10213F]">{p.phone}</strong></span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#1264F5]" /> <strong className="text-[#10213F]">{p.email}</strong></span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#EF4444]" /> <strong className="text-[#10213F]">{p.location}</strong></span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#F59E0B]" /> Joined <strong className="text-[#10213F]">{p.joiningDate}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 shrink-0 self-center sm:self-start">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="secondary"
              size="sm"
              icon={Edit3}
            >
              Edit Profile
            </Button>

            <button
              onClick={handleToggleAvailability}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-xs ${
                isAvailable
                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E6ECF5] hover:bg-[#F1F5F9]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#16A34A] animate-ping' : 'bg-[#94A3B8]'}`} />
              Status: {p.currentAvailability || p.status}
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & EARNINGS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rating */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Rating</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <Star className="w-5 h-5 fill-[#F59E0B]" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#10213F] font-mono">{p.rating} / 5.0</span>
            <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">⭐ Verified 5-Star Detailer</span>
          </div>
        </div>

        {/* Completed Washes */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#10213F] font-mono">{p.completedJobs}</span>
            <span className="text-[11px] text-[#16A34A] font-bold block mt-0.5">{p.onTimeRate}% On-Time Arrival</span>
          </div>
        </div>

        {/* Today Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Today's Payout</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#1264F5] font-mono">₹{p.todayEarnings}</span>
            <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">Daily incentive eligible</span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-[#10213F] font-mono">₹{p.totalEarnings}</span>
            <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">All-time technician income</span>
          </div>
        </div>
      </div>

      {/* 3. TABS: OVERVIEW / JOB HISTORY / CUSTOMER REVIEWS */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
          {[
            { key: 'overview', label: 'Technician Overview', icon: User },
            { key: 'history', label: 'Assigned Job History', icon: History },
            { key: 'reviews', label: 'Customer Reviews', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#1264F5] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs">
            {/* Skills & Certifications */}
            <div>
              <h4 className="font-black text-[#10213F] mb-2 uppercase tracking-wider text-[11px]">
                Specialized Wash Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {(p.skills || '').split(',').map((skill, i) => (
                  <span key={i} className="bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Total Assigned</span>
                <p className="text-xl font-black text-[#10213F] mt-1 font-mono">{p.totalAssigned || 187}</p>
                <span className="text-[10px] text-[#16A34A] font-bold">99.4% Completion rate</span>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Experience Level</span>
                <p className="text-xl font-black text-[#10213F] mt-1">{p.experience || '3.5 Years'}</p>
                <span className="text-[10px] text-[#1264F5] font-bold">Level 3 Master Specialist</span>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Assigned Hub</span>
                <p className="text-xl font-black text-[#10213F] mt-1">Mysuru Central</p>
                <span className="text-[10px] text-[#64748B] font-medium">Van Unit #04</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B]">Filter Service History:</span>
              <div className="flex gap-1.5">
                {['all', 'today', 'week', 'month'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      historyFilter === f ? 'bg-[#1264F5] text-white' : 'bg-[#F8FAFC] text-[#64748B] border border-[#E6ECF5] hover:text-[#10213F]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loadingHistory ? (
              <CardSkeleton />
            ) : historyJobs.length > 0 ? (
              <div className="space-y-3">
                {historyJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/employee/jobs/${job.id || job.bookingNumber}`)}
                    className="p-4 rounded-2xl border border-[#E6ECF5] bg-[#F8FAFC] hover:bg-white hover:border-[#BFDBFE] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#1264F5]">#{job.bookingNumber || job.id}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <h4 className="font-bold text-[#10213F] mt-1">{job.service?.name}</h4>
                      <p className="text-[11px] text-[#64748B]">Customer: <strong className="text-[#10213F]">{job.customerName}</strong> • {job.vehicle?.brand} {job.vehicle?.model} ({job.vehicle?.regNumber})</p>
                    </div>

                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-base font-black text-[#10213F] font-mono block">₹{job.finalAmount}</span>
                      <span className="text-[10px] text-[#64748B]">{job.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] text-center py-6">No historical jobs matching this filter.</p>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-3 text-xs">
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#10213F]">Rahul Sharma (Honda City)</span>
                <span className="text-[#F59E0B] font-bold">⭐⭐⭐⭐⭐ 5.0</span>
              </div>
              <p className="text-[#64748B]">"Venkatesh did an exceptional job cleaning our muddy SUV after a road trip. Very polite, highly professional and punctual."</p>
              <span className="text-[10px] text-[#94A3B8]">22 Aug 2026</span>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#10213F]">Anita Desai (Hyundai Creta)</span>
                <span className="text-[#F59E0B] font-bold">⭐⭐⭐⭐⭐ 5.0</span>
              </div>
              <p className="text-[#64748B]">"Excellent interior vacuuming and AC steam cleaning. The car smells like new. 10/10 recommended!"</p>
              <span className="text-[10px] text-[#94A3B8]">19 Aug 2026</span>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Technician Profile"
        subtitle="Update worker details in database"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Mobile Phone Number</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Skills & Specializations</label>
            <input
              type="text"
              value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Short Bio</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
