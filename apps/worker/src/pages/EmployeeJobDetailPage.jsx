import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { employeeService, bookingService } from '@shared/services/api';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
import { Modal } from '@shared/components/Modal';
import { CardSkeleton } from '@shared/components/SkeletonLoader';
import { ErrorState } from '@shared/components/ErrorState';
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  Mail,
  Car,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Compass,
  Sparkles,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  Sliders,
  Check,
  X,
  Play,
  CheckCheck,
  Send,
  MessageSquare,
  Truck,
  DollarSign,
  User,
  History,
  Layers,
  ZoomIn
} from 'lucide-react';

const STATUS_PROGRESSION = [
  { key: 'Assigned', label: 'Assigned', nextStatus: 'Accepted', nextAction: 'Accept Job', icon: CheckCircle2, btnVariant: 'primary' },
  { key: 'Accepted', label: 'Accepted', nextStatus: 'On The Way', nextAction: 'Start Travel (On The Way)', icon: Navigation, btnVariant: 'primary' },
  { key: 'On The Way', label: 'On The Way', nextStatus: 'Arrived', nextAction: "I've Arrived at Customer", icon: MapPin, btnVariant: 'success' },
  { key: 'Arrived', label: 'Arrived', nextStatus: 'In Progress', nextAction: 'Start Wash Service', icon: Play, btnVariant: 'primary' },
  { key: 'In Progress', label: 'In Progress', nextStatus: 'Completed', nextAction: 'Complete Service', icon: CheckCheck, btnVariant: 'success' },
  { key: 'Completed', label: 'Completed', nextStatus: null, nextAction: 'Service Completed', icon: CheckCheck, btnVariant: 'secondary' }
];

export const EmployeeJobDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, updateBookingStatus } = useAuth();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // GPS Location Sharing
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const gpsWatchRef = useRef(null);

  // Lightbox
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Inspection Form State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    exteriorCondition: 'Normal Dirt',
    interiorCondition: 'Normal',
    existingScratches: '',
    dentsNotes: '',
    brokenParts: '',
    dirtyAreas: 'Lower body, wheel rims, mats',
    inspectionNotes: ''
  });

  // Photo Upload State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoType, setPhotoType] = useState('BEFORE'); // BEFORE | AFTER
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Work Update State
  const [newUpdateText, setNewUpdateText] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Complete Service Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const fetchJobDetails = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    employeeService.getJobById(bookingId)
      .then((data) => {
        if (data && data.id) {
          setJob(data);
          if (data.inspection) {
            setInspectionForm({
              exteriorCondition: data.inspection.exteriorCondition || 'Normal Dirt',
              interiorCondition: data.inspection.interiorCondition || 'Normal',
              existingScratches: data.inspection.existingScratches || '',
              dentsNotes: data.inspection.dentsNotes || '',
              brokenParts: data.inspection.brokenParts || '',
              dirtyAreas: data.inspection.dirtyAreas || '',
              inspectionNotes: data.inspection.inspectionNotes || ''
            });
          }
        } else {
          setError('Assigned job not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load job details');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchJobDetails();

    // Auto refresh every 8 seconds for 3-way synchronization
    const timer = setInterval(() => {
      fetchJobDetails(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [bookingId]);

  // GPS Location Broadcast
  useEffect(() => {
    const stLower = (job?.status || '').toLowerCase();
    const shouldTrack = stLower === 'on the way' || stLower === 'in progress' || stLower === 'arrived';

    if (shouldTrack && navigator.geolocation) {
      setIsSharingLocation(true);
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          employeeService.updateLocation(bookingId, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed || 28.0,
            heading: pos.coords.heading || 90.0
          }).catch(() => {});
        },
        (err) => {
          console.warn('Worker GPS tracking warning:', err.message);
          setIsSharingLocation(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    } else {
      setIsSharingLocation(false);
      if (gpsWatchRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    }

    return () => {
      if (gpsWatchRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, [job?.status, bookingId]);

  // Handle Progressive Status Update
  const handleProgressStatus = async (nextStatus) => {
    const stepMap = {
      'Accepted': 2,
      'On The Way': 2,
      'Arrived': 2,
      'In Progress': 3,
      'Completed': 4
    };
    const step = stepMap[nextStatus] || 2;

    try {
      if (nextStatus === 'Accepted') {
        await employeeService.acceptJob(bookingId);
      } else {
        await employeeService.updateJobStatus(bookingId, nextStatus, step);
      }

      updateBookingStatus(bookingId, nextStatus, step);
      addToast(`Status updated to: ${nextStatus}! All interfaces synchronized.`, 'success');

      // If switched to On The Way, trigger immediate GPS fix
      if (nextStatus === 'On The Way' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          employeeService.updateLocation(bookingId, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: 28.0,
            heading: 90.0
          }).catch(() => {});
        });
      }

      fetchJobDetails(true);
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Save Vehicle Inspection
  const handleSaveInspection = async (e) => {
    e.preventDefault();
    try {
      await employeeService.saveInspection(bookingId, inspectionForm);
      addToast('Vehicle inspection saved to MySQL database!', 'success');
      setShowInspectionModal(false);
      fetchJobDetails(true);
    } catch (err) {
      addToast(`Inspection save failed: ${err.message}`, 'error');
    }
  };

  // Upload Before/After Photos
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please choose an image to upload', 'warning');
      return;
    }
    setUploadingPhoto(true);
    try {
      await employeeService.uploadJobPhoto(bookingId, selectedFile, photoType);
      addToast(`${photoType} wash photo uploaded and saved!`, 'success');
      setShowPhotoModal(false);
      setSelectedFile(null);
      setFilePreview(null);
      fetchJobDetails(true);
    } catch (err) {
      addToast(`Photo upload failed: ${err.message}`, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Post Work Update
  const handlePostWorkUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;

    setSubmittingUpdate(true);
    try {
      await employeeService.postWorkUpdate(bookingId, newUpdateText.trim());
      addToast('Work update posted! Customer notified in real-time.', 'success');
      setNewUpdateText('');
      fetchJobDetails(true);
    } catch (err) {
      addToast(`Failed to post update: ${err.message}`, 'error');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !job) {
    return <ErrorState title="Job Not Found" message={error} onHome={() => navigate('/employee')} />;
  }

  const b = job;
  const currentStatus = b.status || 'Assigned';
  const currentProg = STATUS_PROGRESSION.find(s => s.key.toLowerCase() === currentStatus.toLowerCase()) || STATUS_PROGRESSION[0];
  const nextProg = currentProg.nextStatus ? STATUS_PROGRESSION.find(s => s.key.toLowerCase() === currentProg.nextStatus.toLowerCase()) : null;

  // Filter vehicle customer photos and inspection photos
  const customerVehiclePhotos = (b.photos || []).filter(p => !['BEFORE', 'AFTER'].includes(p.photoType));
  const beforePhotos = b.beforePhotos || (b.photos || []).filter(p => p.photoType === 'BEFORE');
  const afterPhotos = b.afterPhotos || (b.photos || []).filter(p => p.photoType === 'AFTER');

  const customerLat = b.address?.latitude || 12.3118;
  const customerLng = b.address?.longitude || 76.6529;
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 animate-fadeIn">
      {/* 1. HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employee')}
            className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#64748B] hover:text-[#10213F] rounded-2xl transition-colors cursor-pointer"
            title="Back to Assigned Jobs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-black uppercase text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-3 py-0.5 rounded-full">
                Assigned Job #{b.bookingNumber || b.id}
              </span>
              <StatusBadge status={b.status} />
              {isSharingLocation && (
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping"></span> Live GPS Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10213F] mt-1.5">
              {b.service?.name || 'Doorstep Wash Service'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] mt-1 font-medium">
              <span>📅 Scheduled: <strong className="text-[#10213F]">{b.date} ({b.timeSlot})</strong></span>
              <span>•</span>
              <span>🕒 Duration: <strong className="text-[#10213F]">{b.service?.duration || '45 mins'}</strong></span>
              <span>•</span>
              <span>💰 Amount: <strong className="text-[#1264F5] font-black">₹{b.finalAmount}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchJobDetails(true)}
            className="bg-white hover:bg-[#F8FAFC] border border-[#E6ECF5] text-[#10213F] px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1264F5] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Quick Action Button for Status Progression */}
          {nextProg && currentStatus.toLowerCase() !== 'completed' && (
            <Button
              onClick={() => {
                if (nextProg.key === 'Completed') {
                  setShowCompleteModal(true);
                } else {
                  handleProgressStatus(nextProg.key);
                }
              }}
              variant={nextProg.btnVariant || 'primary'}
              size="md"
              icon={nextProg.icon}
              className="font-black text-sm shadow-sm"
            >
              {currentProg.nextAction}
            </Button>
          )}
        </div>
      </div>

      {/* 2. PROGRESSIVE STATUS BAR */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1264F5]" />
            Worker Status Workflow (Synchronized in Real-Time)
          </h3>
          <span className="text-xs font-black text-[#1264F5]">Current: {currentStatus}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STATUS_PROGRESSION.filter(s => s.key !== 'Pending Verification' && s.key !== 'Verified').map((step, idx) => {
            const isCompleted = STATUS_PROGRESSION.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase()) >= idx;
            const isCurrent = step.key.toLowerCase() === currentStatus.toLowerCase();
            return (
              <button
                key={step.key}
                disabled={!isCompleted && step.key !== nextProg?.key}
                onClick={() => {
                  if (step.key === 'Completed') setShowCompleteModal(true);
                  else handleProgressStatus(step.key);
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F0F6FF] border-[#1264F5] text-[#1264F5] font-black shadow-xs ring-2 ring-[#1264F5]/10'
                    : isCompleted
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] font-bold'
                    : step.key === nextProg?.key
                    ? 'bg-[#F0F6FF] border-[#BFDBFE] text-[#1264F5] font-bold hover:bg-[#DBEAFE]'
                    : 'bg-[#F8FAFC] border-[#E6ECF5] text-[#94A3B8] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold opacity-75">Step {idx + 1}</div>
                <div className="text-xs font-bold truncate mt-0.5">{step.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN GRID - 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Customer & Vehicle & Location (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER CARD */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#1264F5]" />
                Customer Contact Details
              </h3>
              <span className="text-xs text-[#64748B] font-mono">Doorstep Washing Request</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Full Name</span>
                <p className="text-base font-black text-[#10213F]">{b.customerName}</p>
                <p className="text-xs text-[#64748B]">{b.customerEmail}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Phone Number</span>
                <p className="text-base font-black text-[#1264F5] font-mono">{b.customerPhone}</p>
              </div>
            </div>

            {/* Call / Email Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${b.customerPhone}`}
                className="flex-1 min-w-[140px] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Phone className="w-4 h-4" /> Call Customer
              </a>
              <a
                href={`mailto:${b.customerEmail}`}
                className="flex-1 min-w-[140px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#10213F] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Mail className="w-4 h-4" /> Email Customer
              </a>
            </div>

            {/* Customer Special Instructions */}
            {b.specialInstructions && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3.5 text-xs text-[#B45309]">
                <strong className="block font-bold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Customer Special Instructions:
                </strong>
                {b.specialInstructions}
              </div>
            )}
          </div>

          {/* VEHICLE DETAILS & PHOTO GALLERY */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-[#1264F5]" />
                Vehicle Information & Customer Photos
              </h3>
              <span className="text-xs font-mono font-black text-[#1264F5] bg-[#F0F6FF] px-2.5 py-0.5 rounded-lg border border-[#BFDBFE]">
                {b.vehicle?.regNumber || b.vehicle?.registration_number}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase block font-bold">Make & Model</span>
                <p className="font-black text-[#10213F] mt-0.5">{b.vehicle?.brand} {b.vehicle?.model}</p>
                <span className="text-[10px] text-[#64748B]">{b.vehicle?.variant || 'Standard'}</span>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase block font-bold">Vehicle Type</span>
                <p className="font-black text-[#1264F5] capitalize mt-0.5">{b.vehicle?.type || 'Sedan'}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase block font-bold">Color</span>
                <p className="font-bold text-[#10213F] mt-0.5">{b.vehicle?.color || 'White'}</p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase block font-bold">Reported Condition</span>
                <p className="font-bold text-[#F59E0B] mt-0.5">{b.vehicleCondition || 'Normal Dirt'}</p>
              </div>
            </div>

            {/* Condition Notes */}
            {b.conditionNotes && (
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] text-xs">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Customer Problem Notes:</span>
                <p className="text-[#10213F] font-semibold mt-0.5">{b.conditionNotes}</p>
              </div>
            )}

            {/* Customer Pre-Uploaded Photos */}
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-2">
                Customer Pre-Uploaded Vehicle Photos ({customerVehiclePhotos.length})
              </span>
              {customerVehiclePhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {customerVehiclePhotos.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setEnlargedImage(p.fileUrl || p.preview)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs"
                    >
                      <img src={p.fileUrl || p.preview} alt="Vehicle" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-[#10213F]/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {p.photoType || `Slot ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] italic">No photos uploaded by customer during booking.</p>
              )}
            </div>
          </div>

          {/* DOORSTEP SERVICE LOCATION & MAP */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
              <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EF4444]" />
                Doorstep Service Location
              </h3>
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1264F5] hover:bg-[#0F52CC] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Start Turn-by-Turn GPS
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Doorstep Address</span>
                <p className="text-sm font-black text-[#10213F] mt-0.5">
                  {b.address?.house}, {b.address?.street ? `${b.address.street}, ` : ''}{b.address?.area}, {b.address?.city} – {b.address?.pincode}
                </p>
                {b.address?.landmark && (
                  <p className="text-xs text-[#64748B] mt-1 font-medium">Landmark: <strong className="text-[#10213F]">{b.address.landmark}</strong></p>
                )}
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E6ECF5] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>GPS Coordinates: <strong className="text-[#10213F] font-mono">{customerLat}° N, {customerLng}° E</strong></span>
                <span className="text-[#1264F5] font-bold">Mysuru Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Service Details, Before/After Photos, Live Updates (1 col) */}
        <div className="space-y-6">
          {/* SERVICE SUMMARY & PAYMENT CARD */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#1264F5]" />
              Package & Pricing Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span className="font-medium">{b.service?.name}</span>
                <span className="font-black text-[#10213F]">₹{b.basePrice}</span>
              </div>

              {b.addons && b.addons.length > 0 && (
                <div className="pt-2 border-t border-[#E6ECF5] space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">Selected Add-ons:</span>
                  {b.addons.map((a, i) => (
                    <div key={i} className="flex justify-between text-[#64748B]">
                      <span>+ {a.name}</span>
                      <span className="text-[#1264F5] font-bold">₹{a.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {b.discountAmount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-bold">
                  <span>Promo Discount ({b.couponApplied})</span>
                  <span>-₹{b.discountAmount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E6ECF5] flex justify-between items-center text-sm font-black text-[#10213F]">
                <span>Total Collectable</span>
                <span className="text-xl font-black text-[#1264F5] font-mono">₹{b.finalAmount}</span>
              </div>

              <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E6ECF5] flex items-center justify-between text-[11px] mt-2">
                <span className="text-[#64748B] font-bold">Payment Method:</span>
                <span className="font-black text-[#10213F]">{b.paymentMethod || 'Cash After Service'}</span>
              </div>
            </div>
          </div>

          {/* TECHNICIAN ACTIONS & INSPECTION FORM */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-3">
            <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
              <Camera className="w-4 h-4 text-[#1264F5]" />
              Detailer Wash Actions
            </h3>

            <div className="space-y-2">
              <Button
                onClick={() => setShowInspectionModal(true)}
                variant="secondary"
                size="sm"
                fullWidth
                icon={FileText}
              >
                Pre-Wash Inspection Form
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => { setPhotoType('BEFORE'); setShowPhotoModal(true); }}
                  variant="outline"
                  size="sm"
                  icon={Camera}
                >
                  Upload Before Photo
                </Button>
                <Button
                  onClick={() => { setPhotoType('AFTER'); setShowPhotoModal(true); }}
                  variant="outline"
                  size="sm"
                  icon={Camera}
                >
                  Upload After Photo
                </Button>
              </div>
            </div>
          </div>

          {/* BEFORE & AFTER PHOTO GALLERIES */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-3">
            <h3 className="text-xs font-black text-[#10213F] uppercase tracking-wider flex items-center justify-between border-b border-[#E6ECF5] pb-2">
              <span>Wash Inspection Photos</span>
              <span className="text-[10px] text-[#64748B]">Before: {beforePhotos.length} • After: {afterPhotos.length}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#F59E0B] block mb-1">Before Wash:</span>
                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {beforePhotos.map((p, i) => (
                      <div key={i} onClick={() => setEnlargedImage(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
                        <img src={p.fileUrl} alt="Before" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#94A3B8] italic">No before photos uploaded</span>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6ECF5]">
                <span className="text-[10px] font-bold text-[#16A34A] block mb-1">After Wash:</span>
                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {afterPhotos.map((p, i) => (
                      <div key={i} onClick={() => setEnlargedImage(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
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

          {/* WORKING UPDATES FEED */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2 border-b border-[#E6ECF5] pb-3">
              <MessageSquare className="w-4 h-4 text-[#1264F5]" />
              Working Updates (Live to Customer)
            </h3>

            {/* Post update input */}
            <form onSubmit={handlePostWorkUpdate} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Foam rinse started, wiping alloys..."
                value={newUpdateText}
                onChange={(e) => setNewUpdateText(e.target.value)}
                className="flex-1 bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl px-3 py-2 outline-none focus:border-[#1264F5] font-semibold placeholder:text-[#94A3B8]"
              />
              <button
                type="submit"
                disabled={submittingUpdate || !newUpdateText.trim()}
                className="p-2 bg-[#1264F5] hover:bg-[#0F52CC] text-white rounded-xl disabled:opacity-40 cursor-pointer shadow-xs"
                title="Send update"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Updates list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(b.workUpdates || []).map((wu) => (
                <div key={wu.id} className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5] text-xs space-y-1">
                  <p className="font-bold text-[#10213F]">{wu.updateText}</p>
                  <span className="text-[10px] font-mono text-[#64748B] block">{wu.createdAt}</span>
                </div>
              ))}
              {(!b.workUpdates || b.workUpdates.length === 0) && (
                <p className="text-xs text-[#94A3B8] italic text-center py-2">No work updates posted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      <Modal
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        title="Vehicle Pre-Wash Inspection Checklist"
        subtitle="Document preexisting car condition before starting pressure wash"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveInspection} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Exterior Dirt Level</label>
            <select
              value={inspectionForm.exteriorCondition}
              onChange={(e) => setInspectionForm({ ...inspectionForm, exteriorCondition: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none font-bold"
            >
              <option value="Light Dust">Light Dust ✨</option>
              <option value="Normal Dirt">Normal Dirt 🚗</option>
              <option value="Heavy Mud">Heavy Mud 🌧️</option>
              <option value="Extreme Grime">Extreme Grime 🟤</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Preexisting Scratches / Paint Imperfections</label>
            <input
              type="text"
              placeholder="e.g. Minor scratch on rear left bumper"
              value={inspectionForm.existingScratches}
              onChange={(e) => setInspectionForm({ ...inspectionForm, existingScratches: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Additional Inspection Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Mud flaps loose, extra care on panoramic sunroof"
              value={inspectionForm.inspectionNotes}
              onChange={(e) => setInspectionForm({ ...inspectionForm, inspectionNotes: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setShowInspectionModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Inspection
            </Button>
          </div>
        </form>
      </Modal>

      {/* PHOTO UPLOAD MODAL */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title={`Upload ${photoType} Wash Photo`}
        subtitle="Saved to MySQL database and shown to Admin & Customer"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Select Photo File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl p-2.5"
              required
            />
          </div>

          {filePreview && (
            <div className="aspect-video rounded-2xl overflow-hidden border border-[#1264F5] shadow-xs">
              <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setShowPhotoModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={uploadingPhoto}>
              Upload Photo
            </Button>
          </div>
        </form>
      </Modal>

      {/* COMPLETE SERVICE MODAL */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Wash Service"
        subtitle="Confirm vehicle inspection is complete and customer is satisfied"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-1">
            <h4 className="font-black text-[#15803D] text-sm">Collect Payment</h4>
            <p className="text-[#166534]">
              Total Collectable: <strong className="text-[#15803D] text-base">₹{b.finalAmount}</strong> ({b.paymentMethod})
            </p>
          </div>

          <div className="space-y-2 text-[#64748B]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Full exterior foam wash and drying complete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Interior cabin vacuuming and mats sanitized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>After-wash photos uploaded to database</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E6ECF5]">
            <Button type="button" variant="secondary" onClick={() => setShowCompleteModal(false)}>
              Back
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={() => {
                setShowCompleteModal(false);
                handleProgressStatus('Completed');
              }}
              icon={CheckCheck}
            >
              Mark Job Completed
            </Button>
          </div>
        </div>
      </Modal>

      {/* LIGHTBOX */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-[#10213F]/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={enlargedImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
