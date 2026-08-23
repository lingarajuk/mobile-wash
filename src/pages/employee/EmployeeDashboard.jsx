import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, bookingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Navigation,
  Camera,
  Play,
  User,
  Compass,
  Sparkles,
  ShieldCheck,
  Eye,
  Check,
  Sliders,
  DollarSign,
  Activity,
  Award,
  Layers,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Car,
  Image as ImageIcon,
  CheckCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user, updateBookingStatus } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all | today | active | upcoming | completed
  const [searchTerm, setSearchTerm] = useState('');

  // Selected vehicle photos modal
  const [viewingPhotosJob, setViewingPhotosJob] = useState(null);

  const [stats, setStats] = useState({
    todayJobs: 0,
    activeJobs: 0,
    upcomingJobs: 0,
    completedJobs: 0,
    todayEarnings: 0,
    totalEarnings: 0
  });

  const fetchJobs = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    employeeService.getJobs('all')
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);

          // Calculate real metrics from MySQL
          const todayStr = new Date().toISOString().split('T')[0];
          const todayCount = data.filter(b => b.date === todayStr).length;
          const activeCount = data.filter(b => ['accepted', 'on the way', 'arrived', 'in progress'].includes((b.status || '').toLowerCase())).length;
          const upcomingCount = data.filter(b => ['assigned', 'verified', 'pending verification', 'confirmed'].includes((b.status || '').toLowerCase())).length;
          const completedCount = data.filter(b => (b.status || '').toLowerCase() === 'completed').length;

          setStats({
            todayJobs: todayCount,
            activeJobs: activeCount,
            upcomingJobs: upcomingCount,
            completedJobs: completedCount,
            todayEarnings: todayCount * 450,
            totalEarnings: completedCount * 450
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load employee jobs:', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchJobs();

    // Polling every 8 seconds for real-time synchronization with Admin & Customer
    const timer = setInterval(() => {
      fetchJobs(true);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleAcceptJob = async (e, bookingId) => {
    e.stopPropagation();
    try {
      await employeeService.acceptJob(bookingId);
      updateBookingStatus(bookingId, 'Accepted', 2);
      addToast(`Job #${bookingId} accepted! You can now start travel.`, 'success');
      fetchJobs(true);
    } catch (err) {
      addToast(`Failed to accept job: ${err.message}`, 'error');
    }
  };

  const handleStartTravel = async (e, bookingId, jobObj) => {
    e.stopPropagation();
    try {
      // Request location permission to share live GPS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              await employeeService.updateLocation(bookingId, { latitude, longitude });
              addToast('Live location shared with Customer & Admin', 'info');
            } catch (locErr) {
              console.warn('Location share error:', locErr);
            }
          },
          (geoErr) => {
            console.warn('Geolocation permission not granted:', geoErr);
          },
          { enableHighAccuracy: true }
        );
      }

      await employeeService.updateJobStatus(bookingId, 'On The Way', 2);
      updateBookingStatus(bookingId, 'On The Way', 2);
      addToast(`Job #${bookingId}: Status updated to ON THE WAY 🚗`, 'success');
      fetchJobs(true);
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const handleQuickStatus = async (e, bookingId, nextStatus, step) => {
    e.stopPropagation();
    try {
      await employeeService.updateJobStatus(bookingId, nextStatus, step);
      updateBookingStatus(bookingId, nextStatus, step);
      addToast(`Job #${bookingId} updated to: ${nextStatus}`, 'success');
      fetchJobs(true);
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const stLower = (job.status || '').toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    let matchTab = true;
    if (activeTab === 'today') matchTab = job.date === todayStr;
    else if (activeTab === 'active') matchTab = ['accepted', 'on the way', 'arrived', 'in progress'].includes(stLower);
    else if (activeTab === 'upcoming') matchTab = ['assigned', 'verified', 'pending verification', 'confirmed'].includes(stLower);
    else if (activeTab === 'completed') matchTab = stLower === 'completed';

    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      (job.bookingNumber || job.id || '').toLowerCase().includes(searchLower) ||
      (job.customerName || '').toLowerCase().includes(searchLower) ||
      (job.customerPhone || '').toLowerCase().includes(searchLower) ||
      (job.service?.name || '').toLowerCase().includes(searchLower) ||
      (job.vehicle?.regNumber || '').toLowerCase().includes(searchLower) ||
      (job.vehicle?.brand || '').toLowerCase().includes(searchLower) ||
      (job.vehicle?.model || '').toLowerCase().includes(searchLower) ||
      (job.address?.area || '').toLowerCase().includes(searchLower) ||
      (job.address?.house || '').toLowerCase().includes(searchLower);

    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn max-w-[1400px] mx-auto">
      {/* 1. EMPLOYEE HERO SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-3 py-0.5 rounded-full">
              TECHNICIAN PORTAL
            </span>
            <span className="text-xs font-bold text-[#64748B]">Mysuru Central Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">
            Welcome back, {user?.name || 'Venkatesh Kumar'}! 👨‍🔧
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Your assigned doorstep washing jobs from MySQL database. Update status in real-time to keep Admin & Customer synchronized.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => fetchJobs(true)}
            className="bg-white hover:bg-[#F8FAFC] border border-[#E6ECF5] text-[#10213F] px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1264F5] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button
            onClick={() => navigate('/employee/profile')}
            variant="secondary"
            size="md"
            icon={User}
          >
            My Profile & Earnings
          </Button>
        </div>
      </div>

      {/* 2. PROMINENT STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Today's Jobs */}
        <div
          onClick={() => setActiveTab('today')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            activeTab === 'today' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/30' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">TODAY'S JOBS</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#10213F] block font-mono">
              {stats.todayJobs}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium mt-0.5 block">Scheduled for today</span>
          </div>
        </div>

        {/* Active Jobs */}
        <div
          onClick={() => setActiveTab('active')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            activeTab === 'active' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/30' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">ACTIVE JOBS</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#10213F] block font-mono">
              {stats.activeJobs}
            </span>
            <span className="text-[11px] text-[#1264F5] font-bold mt-0.5 block">In travel / progress</span>
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div
          onClick={() => setActiveTab('upcoming')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            activeTab === 'upcoming' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/30' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">UPCOMING JOBS</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#10213F] block font-mono">
              {stats.upcomingJobs}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium mt-0.5 block">Assigned for future</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div
          onClick={() => setActiveTab('completed')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            activeTab === 'completed' ? 'border-[#1264F5] ring-2 ring-[#1264F5]/10 bg-[#F0F6FF]/30' : 'border-[#E6ECF5] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">COMPLETED JOBS</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#10213F] block font-mono">
              {stats.completedJobs}
            </span>
            <span className="text-[11px] text-[#16A34A] font-bold mt-0.5 block">Successfully serviced</span>
          </div>
        </div>
      </div>

      {/* 3. CLEAN SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6ECF5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#1264F5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer, vehicle, area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] font-semibold rounded-2xl py-2.5 pl-10 pr-3.5 outline-none focus:border-[#1264F5] focus:bg-white transition-colors placeholder:text-[#64748B]"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E6ECF5] text-xs w-full md:w-auto overflow-x-auto scrollbar-none">
          {[
            { key: 'all', label: `All Jobs (${jobs.length})` },
            { key: 'today', label: `Today (${stats.todayJobs})` },
            { key: 'active', label: `Active (${stats.activeJobs})` },
            { key: 'upcoming', label: `Upcoming (${stats.upcomingJobs})` },
            { key: 'completed', label: `Completed (${stats.completedJobs})` }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'bg-[#1264F5] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#10213F] hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ASSIGNED JOBS LIST / CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredJobs.map((b) => {
            const stLower = (b.status || '').toLowerCase();
            const isAssigned = stLower === 'assigned' || stLower === 'verified' || stLower === 'pending verification';
            const isAccepted = stLower === 'accepted';
            const isOnTheWay = stLower === 'on the way';
            const isArrived = stLower === 'arrived';
            const isInProgress = stLower === 'in progress';
            const isCompleted = stLower === 'completed';

            const lat = b.address?.latitude || 12.3118;
            const lng = b.address?.longitude || 76.6529;
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            // Vehicle Photos if any
            const vehiclePhotos = b.photos || [];

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-md transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                {/* 1. Header: Booking ID & Status & Service Name */}
                <div className="flex items-start justify-between border-b border-[#E6ECF5] pb-3.5 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#1264F5]">
                        #{b.bookingNumber || b.id}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#10213F] mt-1">
                      {b.service?.name || 'Doorstep Wash Package'}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-[#10213F] font-mono block">₹{b.finalAmount}</span>
                    <span className="text-[11px] text-[#64748B] font-bold block">{b.paymentMethod || 'Cash After Service'}</span>
                  </div>
                </div>

                {/* 2. Customer & Vehicle 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Customer Information */}
                  <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">CUSTOMER</span>
                      <p className="font-black text-[#10213F] text-sm mt-0.5">{b.customerName || 'Customer'}</p>
                      <p className="text-xs text-[#1264F5] font-mono font-bold mt-0.5">{b.customerPhone || '+91 98765 43210'}</p>
                    </div>

                    <a
                      href={`tel:${b.customerPhone || '+919876543210'}`}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded-xl font-bold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer
                    </a>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">VEHICLE</span>
                      <p className="font-black text-[#10213F] text-sm mt-0.5 truncate">
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </p>
                      <p className="text-xs text-[#10213F] font-mono font-black mt-0.5">
                        {b.vehicle?.regNumber || b.vehicle?.registration_number || 'KA-09'}
                      </p>
                      <span className="text-[11px] text-[#64748B] font-medium block capitalize">
                        {b.vehicle?.color} • {b.vehicle?.type || b.vehicle?.vehicle_type || 'Car'} • {b.vehicleCondition || 'Normal'}
                      </span>
                    </div>

                    {vehiclePhotos.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setViewingPhotosJob(b)}
                        className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F0F6FF] hover:bg-[#DBEAFE] text-[#1264F5] border border-[#BFDBFE] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> View Photos ({vehiclePhotos.length})
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#94A3B8] italic mt-2">No inspection photos attached</span>
                    )}
                  </div>
                </div>

                {/* 3. Schedule Date & Doorstep Location */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#10213F] font-bold">
                      <Calendar className="w-4 h-4 text-[#1264F5] shrink-0" />
                      <span>{b.date}</span>
                      <span className="text-[#CBD5E1]">•</span>
                      <Clock className="w-4 h-4 text-[#1264F5] shrink-0" />
                      <span>{b.timeSlot}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#64748B]">Duration: {b.service?.duration || '45 mins'}</span>
                  </div>

                  <div className="pt-2 border-t border-[#E6ECF5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2 text-[#10213F] font-medium">
                      <MapPin className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#10213F] block">
                          {b.address ? `${b.address.house}, ${b.address.street ? b.address.street + ', ' : ''}${b.address.area}, ${b.address.city}` : 'Mysuru'}
                        </span>
                        {b.address?.landmark && (
                          <span className="text-[11px] text-[#64748B]">Landmark: {b.address.landmark}</span>
                        )}
                      </div>
                    </div>

                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#1264F5] border border-[#E6ECF5] rounded-xl font-bold text-xs transition-colors shrink-0 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Open Map
                    </a>
                  </div>
                </div>

                {/* 4. Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6ECF5]">
                  <Button
                    onClick={() => navigate(`/employee/jobs/${b.id || b.bookingNumber}`)}
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                  >
                    View Full Details
                  </Button>

                  {/* Stage-based Progression Buttons */}
                  <div className="flex items-center gap-2">
                    {isAssigned && (
                      <button
                        onClick={(e) => handleAcceptJob(e, b.id)}
                        className="px-4 py-2 text-xs font-black bg-[#1264F5] hover:bg-[#0F52CC] text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" /> Accept Job
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={(e) => handleStartTravel(e, b.id, b)}
                        className="px-4 py-2 text-xs font-black bg-[#08BFE8] hover:bg-[#06A5C8] text-[#10213F] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" /> Start Travel
                      </button>
                    )}

                    {isOnTheWay && (
                      <button
                        onClick={(e) => handleQuickStatus(e, b.id, 'Arrived', 2)}
                        className="px-4 py-2 text-xs font-black bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" /> I've Arrived
                      </button>
                    )}

                    {isArrived && (
                      <button
                        onClick={(e) => handleQuickStatus(e, b.id, 'In Progress', 3)}
                        className="px-4 py-2 text-xs font-black bg-[#1264F5] hover:bg-[#0F52CC] text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" /> Start Service
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => navigate(`/employee/jobs/${b.id || b.bookingNumber}`)}
                        className="px-4 py-2 text-xs font-black bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> Update Work / Photos
                      </button>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-black">
                        <CheckCheck className="w-4 h-4" /> Service Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#E6ECF5] text-center space-y-3 shadow-xs">
          <Briefcase className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-bold text-[#10213F]">No assigned jobs in this tab</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            When the supervisor assigns new doorstep washing jobs to you in MySQL, they will appear here automatically.
          </p>
        </div>
      )}

      {/* MODAL: VIEW VEHICLE PHOTOS */}
      <Modal
        isOpen={!!viewingPhotosJob}
        onClose={() => setViewingPhotosJob(null)}
        title={`Vehicle Photos • Booking #${viewingPhotosJob?.bookingNumber || viewingPhotosJob?.id}`}
        subtitle={`${viewingPhotosJob?.vehicle?.brand} ${viewingPhotosJob?.vehicle?.model} (${viewingPhotosJob?.vehicle?.regNumber})`}
        maxWidth="max-w-2xl"
      >
        {viewingPhotosJob && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(viewingPhotosJob.photos || []).map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {p.photoType || `Photo ${idx + 1}`}
                  </span>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-[#E6ECF5] shadow-xs">
                    <img src={p.fileUrl || p.preview} alt="Vehicle photo" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E6ECF5] flex justify-end">
              <Button onClick={() => setViewingPhotosJob(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
