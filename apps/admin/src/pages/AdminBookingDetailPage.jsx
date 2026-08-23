import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService, bookingService } from '@shared/services/api';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
import { Modal } from '@shared/components/Modal';
import { CardSkeleton } from '@shared/components/SkeletonLoader';
import { ErrorState } from '@shared/components/ErrorState';
import { INITIAL_EMPLOYEES } from '@shared/data/mockData';
import {
  ArrowLeft,
  RefreshCw,
  User,
  Phone,
  Mail,
  Car,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  UserCheck,
  Camera,
  ShieldCheck,
  Compass,
  Navigation,
  Sparkles,
  AlertCircle,
  FileText,
  Star,
  Check,
  X,
  Wand2,
  Eye,
  Sliders,
  History,
  Activity,
  Award,
  Truck
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Pending Verification', label: 'Submitted' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Assigned', label: 'Assigned' },
  { key: 'Accepted', label: 'Accepted' },
  { key: 'On The Way', label: 'On The Way' },
  { key: 'Arrived', label: 'Arrived' },
  { key: 'In Progress', label: 'Service In Progress' },
  { key: 'Completed', label: 'Service Completed' },
  { key: 'Customer Reviewed', label: 'Reviewed' }
];

export const AdminBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, updateBookingStatus } = useAuth();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    exteriorCondition: 'Normal',
    interiorCondition: 'Normal',
    existingScratches: '',
    dentsNotes: '',
    brokenParts: '',
    dirtyAreas: '',
    inspectionNotes: ''
  });

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchBooking = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    adminService.getBookingById(bookingId)
      .then((data) => {
        if (data && data.id) {
          setBooking(data);
          if (data.employee?.id) setSelectedEmpId(data.employee.id);
          if (data.inspection) {
            setInspectionForm({
              exteriorCondition: data.inspection.exteriorCondition || 'Normal',
              interiorCondition: data.inspection.interiorCondition || 'Normal',
              existingScratches: data.inspection.existingScratches || '',
              dentsNotes: data.inspection.dentsNotes || '',
              brokenParts: data.inspection.brokenParts || '',
              dirtyAreas: data.inspection.dirtyAreas || '',
              inspectionNotes: data.inspection.inspectionNotes || ''
            });
          }
        } else {
          setError('Booking record not found in database.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch booking details');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchBooking();
    adminService.getEmployees().then(empList => {
      if (Array.isArray(empList) && empList.length > 0) {
        setEmployees(empList);
        if (!selectedEmpId) setSelectedEmpId(empList[0].id);
      }
    }).catch(() => {});
  }, [bookingId]);

  // Actions
  const handleVerify = async () => {
    try {
      await adminService.verifyBooking(bookingId);
      updateBookingStatus(bookingId, 'Verified', 1);
      addToast(`Booking #${bookingId} verified! Ready for mobile technician assignment.`, 'success');
      fetchBooking(true);
    } catch (e) {
      addToast(`Verification error: ${e.message}`, 'error');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const emp = employees.find(e => e.id === selectedEmpId) || { id: selectedEmpId, name: 'Venkatesh Kumar', phone: '+91 91234 56789' };
      await adminService.assignEmployee(bookingId, emp);
      updateBookingStatus(bookingId, 'Assigned', 1);
      addToast(`Technician ${emp.name} assigned to booking #${bookingId}!`, 'success');
      setShowAssignModal(false);
      fetchBooking(true);
    } catch (e) {
      addToast(`Assignment error: ${e.message}`, 'error');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await adminService.rejectBooking(bookingId, rejectionReason || 'Operational constraint');
      updateBookingStatus(bookingId, 'Rejected', 0);
      addToast(`Booking #${bookingId} has been rejected.`, 'info');
      setShowRejectModal(false);
      fetchBooking(true);
    } catch (e) {
      addToast(`Rejection error: ${e.message}`, 'error');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot) {
      addToast('Please select new date and time slot', 'warning');
      return;
    }
    try {
      await adminService.rescheduleBooking(bookingId, { date: rescheduleDate, timeSlot: rescheduleSlot });
      addToast(`Booking #${bookingId} rescheduled to ${rescheduleDate} (${rescheduleSlot})`, 'success');
      setShowRescheduleModal(false);
      fetchBooking(true);
    } catch (e) {
      addToast(`Reschedule error: ${e.message}`, 'error');
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    try {
      await adminService.cancelBooking(bookingId, cancelReason || 'Cancelled by Admin Supervisor');
      updateBookingStatus(bookingId, 'Cancelled', 0);
      addToast(`Booking #${bookingId} cancelled. Customer and worker notified.`, 'info');
      setShowCancelModal(false);
      fetchBooking(true);
    } catch (e) {
      addToast(`Cancellation error: ${e.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-6 text-[#10213F]">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !booking) {
    return <ErrorState title="Booking Not Found" message={error} onHome={() => navigate('/admin/bookings')} />;
  }

  const b = booking;
  const currentStatusLower = (b.status || '').toLowerCase();
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key.toLowerCase() === currentStatusLower);

  const customerPhotos = (b.photos || []).filter(p => !['BEFORE', 'AFTER'].includes(p.photoType));
  const beforePhotos = b.beforePhotos || (b.photos || []).filter(p => p.photoType === 'BEFORE');
  const afterPhotos = b.afterPhotos || (b.photos || []).filter(p => p.photoType === 'AFTER');

  return (
    <div className="space-y-6 pb-24 animate-fadeIn max-w-[1440px] mx-auto text-[#10213F]">
      {/* 1. TOP HEADER & STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#10213F] rounded-2xl transition-colors cursor-pointer"
            title="Back to Bookings List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-black uppercase text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                Booking Reference
              </span>
              <StatusBadge status={b.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10213F] mt-1">
              Booking #{b.bookingNumber || b.id}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] mt-1 font-bold">
              <span>📅 Scheduled: <strong className="text-[#10213F]">{b.date} ({b.timeSlot})</strong></span>
              <span>•</span>
              <span>🕒 Created: {b.createdAt}</span>
              <span>•</span>
              <span>🔄 Updated: {b.updatedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchBooking(true)}
            className="bg-white hover:bg-[#F8FAFC] border border-[#E6ECF5] text-[#10213F] px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1264F5] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Live Status
          </button>

          {(currentStatusLower === 'pending verification' || currentStatusLower === 'pending') && (
            <>
              <Button onClick={handleVerify} variant="success" size="md" icon={CheckCircle2}>
                Verify Booking
              </Button>
              <Button onClick={() => setShowRejectModal(true)} variant="danger" size="md" icon={XCircle}>
                Reject Booking
              </Button>
            </>
          )}

          {currentStatusLower === 'verified' && (
            <Button onClick={() => setShowAssignModal(true)} variant="primary" size="md" icon={UserCheck}>
              Assign Technician
            </Button>
          )}
        </div>
      </div>

      {/* 2. COMPLETE STATUS TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
          <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#1264F5]" /> Booking Lifecycle Timeline
          </h3>
          <span className="text-xs text-[#475569] font-mono font-bold">
            Active Phase: <strong className="text-[#1264F5] capitalize">{b.status}</strong>
          </span>
        </div>

        {/* Visual Progress Steps */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[760px] justify-between relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#E6ECF5] z-0" />
            {STATUS_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? 'bg-[#1264F5] text-white ring-4 ring-[#1264F5]/20 scale-110 shadow-md'
                        : isPassed
                        ? 'bg-[#16A34A] text-white shadow-xs'
                        : 'bg-[#F8FAFC] border border-[#E6ECF5] text-[#94A3B8]'
                    }`}
                  >
                    {isPassed && !isCurrent ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-black whitespace-nowrap ${
                      isCurrent ? 'text-[#1264F5]' : isPassed ? 'text-[#10213F]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): Customer, Vehicle, Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER INFORMATION CARD */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2 uppercase tracking-wider">
                <User className="w-4 h-4 text-[#1264F5]" /> Customer Information
              </h3>
              <span className="text-xs text-[#475569]">
                Customer Name: <strong className="text-[#10213F]">{b.customerName || 'Rahul Sharma'}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={b.customerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={b.customerName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#BFDBFE] shadow-xs shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-black text-[#10213F]">{b.customerName || 'Rahul Sharma'}</h4>
                  <span className="bg-[#F0F6FF] text-[#1264F5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                    ⭐ {b.customerStats?.averageRating || 4.9} Rating
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <a href={`tel:${b.customerPhone}`} className="text-[#1264F5] font-mono hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {b.customerPhone || '+91 98765 43210'}
                  </a>
                  <a href={`mailto:${b.customerEmail}`} className="text-[#10213F] font-mono hover:underline flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#475569]" /> {b.customerEmail || 'customer@example.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${b.customerPhone}`}
                  className="px-3 py-2 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
              </div>
            </div>
          </div>

          {/* VEHICLE INFORMATION & CUSTOMER PHOTOS */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2 uppercase tracking-wider">
                <Car className="w-4 h-4 text-[#1264F5]" /> Vehicle Information & Pre-Inspection Photos
              </h3>
              <span className="font-mono font-black text-[#1264F5] bg-[#F0F6FF] px-2.5 py-0.5 rounded-lg border border-[#BFDBFE] text-xs">
                {b.vehicle?.regNumber || b.vehicle?.registration_number || 'KA-09-MA-7821'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#475569] uppercase block font-bold">Make & Model</span>
                <p className="font-black text-[#10213F] mt-0.5">{b.vehicle?.brand} {b.vehicle?.model}</p>
                <span className="text-[10px] text-[#475569]">{b.vehicle?.variant || 'Standard Edition'}</span>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#475569] uppercase block font-bold">Vehicle Type</span>
                <p className="font-black text-[#1264F5] capitalize mt-0.5">{b.vehicle?.type || 'Sedan'}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#475569] uppercase block font-bold">Color</span>
                <p className="font-bold text-[#10213F] mt-0.5">{b.vehicle?.color || 'White'}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#475569] uppercase block font-bold">Reported Condition</span>
                <p className="font-bold text-[#F59E0B] mt-0.5">{b.vehicleCondition || 'Normal Dirt'}</p>
              </div>
            </div>

            {/* Customer Uploaded Vehicle Photos */}
            <div>
              <span className="text-[10px] text-[#475569] uppercase font-bold block mb-2">
                Customer Pre-Uploaded Vehicle Photos ({customerPhotos.length})
              </span>
              {customerPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {customerPhotos.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg(p.fileUrl || p.preview)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs"
                    >
                      <img src={p.fileUrl || p.preview} alt="Vehicle" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-[#10213F]/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {p.photoType || `Angle ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] italic">No vehicle photos uploaded by customer.</p>
              )}
            </div>
          </div>

          {/* DOORSTEP LOCATION & GPS NAVIGATION */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#EF4444]" /> Doorstep Service Address
              </h3>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${b.address?.latitude || 12.3118},${b.address?.longitude || 76.6529}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1264F5] hover:bg-[#0F52CC] text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Open Google Maps
              </a>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5] space-y-2 text-xs font-bold">
              <p className="text-sm font-black text-[#10213F]">
                {b.address?.house}, {b.address?.street ? `${b.address.street}, ` : ''}{b.address?.area}, {b.address?.city} – {b.address?.pincode}
              </p>
              {b.address?.landmark && (
                <p className="text-xs text-[#475569]">Landmark: <strong className="text-[#10213F]">{b.address.landmark}</strong></p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#E6ECF5] text-[11px] text-[#475569]">
                <span>GPS: <strong className="text-[#10213F] font-mono">{b.address?.latitude || '12.3118'}° N, {b.address?.longitude || '76.6529'}° E</strong></span>
                <span className="text-[#1264F5] font-black">Mysuru Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Service Summary, Assigned Worker, Before/After Photos */}
        <div className="space-y-6">
          {/* PACKAGE & PRICING DETAILS */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#1264F5]" /> Package & Pricing Breakdown
            </h3>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between text-[#475569]">
                <span>{b.service?.name || 'Doorstep Wash Package'}</span>
                <span className="font-black text-[#10213F]">₹{b.basePrice || b.finalAmount}</span>
              </div>

              {b.addons && b.addons.length > 0 && (
                <div className="pt-2 border-t border-[#E6ECF5] space-y-1">
                  <span className="text-[10px] text-[#475569] uppercase font-bold">Selected Add-ons:</span>
                  {b.addons.map((a, i) => (
                    <div key={i} className="flex justify-between text-[#475569]">
                      <span>+ {a.name}</span>
                      <span className="text-[#1264F5] font-bold">₹{a.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#E6ECF5] flex justify-between items-center text-sm font-black text-[#10213F]">
                <span>Total Collectable</span>
                <span className="text-xl font-black text-[#1264F5] font-mono">₹{b.finalAmount}</span>
              </div>

              <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E6ECF5] flex items-center justify-between text-[11px] mt-2">
                <span className="text-[#475569] font-bold">Payment Method:</span>
                <span className="font-black text-[#10213F]">{b.paymentMethod || 'Cash After Service'}</span>
              </div>
            </div>
          </div>

          {/* ASSIGNED TECHNICIAN CARD */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-3">
            <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
              <Truck className="w-4 h-4 text-[#1264F5]" /> Assigned Mobile Technician
            </h3>

            {b.employee?.name ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={b.employee?.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'}
                    alt={b.employee?.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E6ECF5]"
                  />
                  <div>
                    <h4 className="font-black text-[#10213F] text-sm">{b.employee.name}</h4>
                    <p className="text-xs text-[#1264F5] font-mono font-bold">{b.employee.phone}</p>
                    <span className="text-[10px] text-[#475569] block">{b.employee.designation || 'Specialist'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setShowAssignModal(true)} variant="outline" size="sm" fullWidth icon={UserCheck}>
                    Reassign Tech
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-[#475569] font-bold">No technician assigned yet</p>
                <Button onClick={() => setShowAssignModal(true)} variant="primary" size="sm" fullWidth icon={UserCheck}>
                  Assign Technician
                </Button>
              </div>
            )}
          </div>

          {/* BEFORE & AFTER WASH PHOTOS */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-3">
            <h3 className="text-xs font-black text-[#10213F] uppercase tracking-wider flex items-center justify-between border-b border-[#E6ECF5] pb-2">
              <span>Technician Wash Photos</span>
              <span className="text-[10px] text-[#475569]">Before: {beforePhotos.length} • After: {afterPhotos.length}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-[#F59E0B] block mb-1">Before Wash:</span>
                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {beforePhotos.map((p, i) => (
                      <div key={i} onClick={() => setLightboxImg(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
                        <img src={p.fileUrl} alt="Before" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#94A3B8] italic">No before photos uploaded</span>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6ECF5]">
                <span className="text-[10px] font-black text-[#16A34A] block mb-1">After Wash:</span>
                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {afterPhotos.map((p, i) => (
                      <div key={i} onClick={() => setLightboxImg(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
                        <img src={p.fileUrl} alt="After" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#94A3B8] italic">No after photos uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ASSIGN TECHNICIAN */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Mobile Technician Van"
        subtitle={`Booking #${b.bookingNumber || b.id} • ${b.service?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-black text-[#10213F] block mb-1.5">Choose Mobile Technician</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] font-bold rounded-xl p-3 outline-none focus:border-[#1264F5]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.phone}) – {emp.role || emp.designation || 'Technician'} ⭐ {emp.rating || '4.9'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={UserCheck}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-[#10213F]/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={lightboxImg} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
