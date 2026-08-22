import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Phone, MessageSquare, MapPin, Navigation, ShieldCheck, Star, Clock, Car } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';

export const LiveTrackingModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const emp = booking.employee || {
    name: 'Venkatesh Kumar',
    phone: '+91 91234 56789',
    rating: 4.9,
    completedJobs: 184,
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Washing Professional Tracking"
      subtitle={`Booking #${booking.id} • ${booking.service.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* MAP PLACEHOLDER */}
        <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner flex items-center justify-center">
          {/* Simulated Dark Map Pattern background */}
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

          {/* Map Route Graphic Simulation */}
          <svg className="absolute inset-0 w-full h-full stroke-cyan-400 stroke-[3] fill-none" style={{ strokeDasharray: '6 6' }}>
            <path d="M 60 180 Q 180 80 340 120" />
          </svg>

          {/* Employee Moving Marker */}
          <div className="absolute left-[30%] top-[35%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <div className="bg-cyan-500 text-slate-950 p-2 rounded-full shadow-lg shadow-cyan-500/50 border-2 border-white">
              <Car className="w-5 h-5 fill-slate-950" />
            </div>
            <span className="bg-slate-900/90 text-cyan-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/40 mt-1 shadow">
              Technician (En Route)
            </span>
          </div>

          {/* Customer Destination Marker */}
          <div className="absolute right-[20%] top-[45%] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg shadow-rose-500/50 border-2 border-white">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
            <span className="bg-slate-900/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-700 mt-1">
              Your Doorstep
            </span>
          </div>

          {/* ETA Floating Card */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Estimated Arrival</span>
              <span className="text-sm font-extrabold text-white">12 – 15 Mins (2.4 km)</span>
            </div>
          </div>
        </div>

        {/* EMPLOYEE ASSIGNED CARD */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={emp.photo}
              alt={emp.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Pro
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars rating={emp.rating} size="xs" />
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{emp.completedJobs} jobs done</span>
              </div>
            </div>
          </div>

          {/* Call & Message Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${emp.phone}`}
              className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl transition-colors"
              title="Call Professional"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => alert(`Opening chat window with ${emp.name}`)}
              className="p-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 rounded-xl transition-colors"
              title="Send Message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TIMELINE PROGRESS */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <h5 className="text-xs font-bold text-slate-300 mb-3">Service Timeline Status</h5>
          <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
              <p className="text-xs font-bold text-emerald-400">Booking Confirmed</p>
              <p className="text-[10px] text-slate-400">System verified date & slot</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
              <p className="text-xs font-bold text-emerald-400">Professional Assigned ({emp.name})</p>
              <p className="text-[10px] text-slate-400">Equipped with mobile high-pressure foam unit</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping ring-4 ring-slate-900" />
              <p className="text-xs font-bold text-cyan-400">Professional On The Way 🚗</p>
              <p className="text-[10px] text-slate-400">Driving to {booking.address.area}, Mysuru</p>
            </div>
            <div className="relative opacity-50">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-slate-900" />
              <p className="text-xs font-bold text-slate-300">Service In Progress</p>
              <p className="text-[10px] text-slate-400">High pressure wash & detailing</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
