import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { bookingService, employeeService } from '../../services/api';
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
  X,
  Upload,
  User,
  Compass
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user, updateBookingStatus } = useAuth();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [activeJobModal, setActiveJobModal] = useState(null);

  const fetchJobs = () => {
    employeeService.getJobs().then(list => {
      if (Array.isArray(list)) {
        const formatted = list.map(b => ({
          id: b.id,
          customerName: b.address ? `${b.address.house}, ${b.address.street}` : 'Customer',
          customerPhone: '+91 98765 43210',
          serviceName: b.service?.name || 'Premium Wash',
          vehicleName: b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.regNumber})` : 'Vehicle',
          address: b.address ? `${b.address.house}, ${b.address.street}, ${b.address.area}, ${b.address.city}` : 'Mysuru',
          latitude: b.address?.latitude || 12.3118,
          longitude: b.address?.longitude || 76.6529,
          timeSlot: b.timeSlot,
          amount: b.finalAmount,
          paymentStatus: `${b.paymentStatus} (${b.paymentMethod})`,
          status: b.status,
          beforePhotos: (b.photos || []).filter(p => p.photoType === 'BEFORE').map(p => p.fileUrl),
          afterPhotos: (b.photos || []).filter(p => p.photoType === 'AFTER').map(p => p.fileUrl)
        }));
        setJobs(formatted);
      }
    }).catch((err) => {
      console.warn('Failed to load employee jobs:', err);
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    const stepMap = {
      'Confirmed': 1,
      'Assigned': 1,
      'Accepted': 2,
      'On The Way': 2,
      'Arrived': 2,
      'In Progress': 3,
      'Completed': 4,
      'Cancelled': 0
    };
    const step = stepMap[newStatus] ?? 2;

    try {
      await employeeService.updateJobStatus(jobId, newStatus, step);
      updateBookingStatus(jobId, newStatus, step);
      addToast(`Job #${jobId} status updated to: ${newStatus}`, 'success');
      fetchJobs();
    } catch (err) {
      addToast(`Status update failed: ${err.message}`, 'error');
    }
  };

  const handleOpenGoogleMaps = (lat, lng) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
    addToast('Opening Google Maps navigation to customer location...', 'info');
  };

  const handlePhotoUpload = (jobId, type, e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const urls = files.map(f => URL.createObjectURL(f));
      setJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            [type]: [...j[type], ...urls]
          };
        }
        return j;
      }));
      addToast(`${type === 'beforePhotos' ? 'Before' : 'After'} photo added`, 'info');
    }
  };

  const removePhoto = (jobId, type, idx) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          [type]: j[type].filter((_, i) => i !== idx)
        };
      }
      return j;
    }));
  };

  const todayEarnings = jobs.filter(j => j.status === 'Completed').reduce((a, b) => a + b.amount, 0) + 1450;

  return (
    <div className="space-y-6 pb-16">
      {/* Employee Top Summary Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/20 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.photo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Technician Portal</span>
              <h1 className="text-xl font-bold text-white">{user?.name || 'Venkatesh Kumar'}</h1>
              <p className="text-xs text-slate-400">Rating: ⭐ 4.9 • 184 Jobs Done</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Earnings</span>
            <span className="text-xl font-extrabold text-amber-400">₹{todayEarnings}</span>
          </div>
        </div>

        {/* DASHBOARD METRICS */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-lg font-bold text-white">{jobs.length}</span>
            <span className="text-[10px] text-slate-400 block">Today's Jobs</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-lg font-bold text-amber-400">{jobs.filter(j => j.status !== 'Completed').length}</span>
            <span className="text-[10px] text-slate-400 block">Pending</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-lg font-bold text-emerald-400">12</span>
            <span className="text-[10px] text-slate-400 block">Completed</span>
          </div>
        </div>
      </div>

      {/* JOB CARDS */}
      <div>
        <h3 className="text-base font-extrabold text-white mb-3">Assigned Wash Requests</h3>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">Job #{job.id}</span>
                  <h4 className="text-base font-bold text-white">{job.serviceName}</h4>
                </div>
                <StatusBadge status={job.status} />
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">{job.customerName} ({job.customerPhone})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{job.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2 col-span-full">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{job.address}</span>
                </div>
              </div>

              {/* Price & Payment */}
              <div className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Vehicle: <strong className="text-white">{job.vehicleName}</strong></span>
                <span className="font-bold text-emerald-400">₹{job.amount} ({job.paymentStatus})</span>
              </div>

              {/* ACTIONS & GOOGLE MAPS NAVIGATION */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                {job.status === 'Assigned' && (
                  <Button onClick={() => handleUpdateStatus(job.id, 'Accepted')} variant="primary" size="sm" fullWidth>
                    Accept Job
                  </Button>
                )}

                {job.status === 'Accepted' && (
                  <Button onClick={() => handleUpdateStatus(job.id, 'On The Way')} variant="primary" size="sm" icon={Navigation}>
                    Start Driving (On The Way)
                  </Button>
                )}

                <button
                  onClick={() => handleOpenGoogleMaps(job.latitude, job.longitude)}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-400" /> View Customer Location (Google Maps)
                </button>

                {job.status === 'On The Way' && (
                  <Button onClick={() => handleUpdateStatus(job.id, 'Arrived')} variant="secondary" size="sm" icon={MapPin}>
                    Mark Reached Location
                  </Button>
                )}

                {job.status === 'Arrived' && (
                  <Button onClick={() => handleUpdateStatus(job.id, 'In Progress')} variant="primary" size="sm" icon={Play}>
                    Start Vehicle Wash
                  </Button>
                )}

                {job.status === 'In Progress' && (
                  <Button onClick={() => setActiveJobModal(job)} variant="outline" size="sm" icon={Camera}>
                    Upload Before/After Photos
                  </Button>
                )}

                {job.status === 'In Progress' && (
                  <Button onClick={() => handleUpdateStatus(job.id, 'Completed')} variant="success" size="sm" icon={CheckCircle2}>
                    Complete Service & Collect Payment
                  </Button>
                )}

                <a href={`tel:${job.customerPhone}`} className="p-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 ml-auto">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BEFORE / AFTER PHOTO UPLOADER MODAL */}
      <Modal
        isOpen={!!activeJobModal}
        onClose={() => setActiveJobModal(null)}
        title={`Wash Photos for Job #${activeJobModal?.id}`}
        maxWidth="max-w-md"
      >
        {activeJobModal && (
          <div className="space-y-5 text-xs">
            {/* Before Photos */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">Before Wash Inspection Photos</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeJobModal.beforePhotos.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-700 overflow-hidden shrink-0">
                    <img src={src} alt="Before" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(activeJobModal.id, 'beforePhotos', idx)} className="absolute top-1 right-1 bg-slate-950 text-rose-400 p-0.5 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer shrink-0">
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add Before</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(activeJobModal.id, 'beforePhotos', e)} className="hidden" />
                </label>
              </div>
            </div>

            {/* After Photos */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">After Wash Sparkle Photos</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeJobModal.afterPhotos.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-700 overflow-hidden shrink-0">
                    <img src={src} alt="After" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(activeJobModal.id, 'afterPhotos', idx)} className="absolute top-1 right-1 bg-slate-950 text-rose-400 p-0.5 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-cyan-500/40 bg-slate-900 flex flex-col items-center justify-center text-cyan-400 hover:text-cyan-300 cursor-pointer shrink-0">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add After</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(activeJobModal.id, 'afterPhotos', e)} className="hidden" />
                </label>
              </div>
            </div>

            <Button onClick={() => setActiveJobModal(null)} variant="primary" fullWidth>
              Save Photos
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
