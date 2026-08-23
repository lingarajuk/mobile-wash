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
      subtitle={`Booking #${booking.bookingNumber || booking.id} • ${booking.service?.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* MAP PLACEHOLDER */}
        <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-[#E6ECF5] bg-[#F8FAFC] shadow-inner flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />

          {/* Map Route Graphic Simulation */}
          <svg className="absolute inset-0 w-full h-full stroke-[#1264F5] stroke-[3] fill-none" style={{ strokeDasharray: '6 6' }}>
            <path d="M 60 180 Q 180 80 340 120" />
          </svg>

          {/* Employee Moving Marker */}
          <div className="absolute left-[30%] top-[35%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <div className="bg-[#1264F5] text-white p-2 rounded-full shadow-lg border-2 border-white">
              <Car className="w-5 h-5 fill-white" />
            </div>
            <span className="bg-white text-[#1264F5] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#BFDBFE] mt-1 shadow-xs">
              Technician (En Route)
            </span>
          </div>

          {/* Customer Destination Marker */}
          <div className="absolute right-[20%] top-[45%] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-[#EF4444] text-white p-2 rounded-full shadow-lg border-2 border-white">
              <MapPin className="w-5 h-5 fill-white" />
            </div>
            <span className="bg-white text-[#10213F] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#E6ECF5] mt-1 shadow-xs">
              Your Doorstep
            </span>
          </div>
        </div>

        {/* ETA & Distance Strip */}
        <div className="bg-[#F0F6FF] border border-[#BFDBFE] p-3 rounded-2xl flex items-center justify-between text-xs text-[#1264F5]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1264F5]" />
            <span className="font-bold">Estimated Arrival: <strong>12 Mins</strong> (3.4 km away)</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-white px-2 py-0.5 rounded-full font-bold border border-[#BFDBFE]">
            Live GPS Active
          </span>
        </div>

        {/* Technician Profile Card */}
        <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={emp.photo}
              alt={emp.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#E6ECF5]"
            />
            <div>
              <h4 className="text-sm font-bold text-[#10213F]">{emp.name}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <RatingStars rating={emp.rating} size="sm" showValue={true} />
                <span className="text-[10px] text-[#64748B]">({emp.completedJobs} washes)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${emp.phone}`}
              className="p-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl transition-colors shadow-xs"
              title="Call Technician"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-[#1264F5] hover:bg-[#0F52CC] text-white rounded-xl transition-colors shadow-xs"
              title="Message Technician"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Service Address */}
        <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E6ECF5] text-xs text-[#64748B] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1264F5] shrink-0" />
          <span className="truncate">Destination: <strong className="text-[#10213F]">{booking.address?.house}, {booking.address?.area}, {booking.address?.city}</strong></span>
        </div>

        {/* Close Button */}
        <Button onClick={onClose} variant="secondary" fullWidth>
          Close Live Tracking
        </Button>
      </div>
    </Modal>
  );
};
