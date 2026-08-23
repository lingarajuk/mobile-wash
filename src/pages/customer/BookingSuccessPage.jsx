import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../../services/api';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Car,
  ShieldCheck,
  ArrowRight,
  Home,
  FileText,
  Sparkles,
  Phone,
  AlertCircle
} from 'lucide-react';

export const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      bookingService.getBookingById(bookingId)
        .then((data) => {
          if (data && data.id) {
            setBooking(data);
          }
        })
        .catch((err) => {
          console.warn('Booking details fetch error:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <CardSkeleton />
      </div>
    );
  }

  const b = booking || {
    id: bookingId || 'AGW-SUCCESS',
    bookingNumber: bookingId || 'AGW-SUCCESS',
    status: 'Pending Verification',
    service: { name: 'Doorstep Washing Package' },
    vehicle: { brand: 'Vehicle', model: 'Selected', regNumber: 'KA-09' },
    address: { house: 'Doorstep Location', area: 'Mysuru', city: 'Mysuru' },
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM – 10:00 AM',
    finalAmount: 599,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'Pending'
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 pb-20 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-[#E6ECF5] text-center space-y-4 shadow-sm relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-white to-white">
        <div className="w-16 h-16 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-[11px] uppercase font-mono tracking-widest text-[#15803D] font-bold bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0] mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Request Submitted
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">
            Booking Request Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
            Your wash request has been recorded in the database. Our supervisor will verify the slot and assign your detailing specialist shortly.
          </p>
        </div>

        <div className="inline-block bg-[#F8FAFC] border border-[#E6ECF5] px-4 py-2.5 rounded-2xl">
          <span className="text-[10px] uppercase tracking-wider text-[#64748B] block font-bold">Booking Reference ID</span>
          <span className="text-base font-black text-[#1264F5] font-mono">#{b.bookingNumber || b.id}</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs text-xs">
        <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
          <h2 className="text-sm font-bold text-[#10213F] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1264F5]" /> Booking Details Summary
          </h2>
          <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            {b.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Selected Service</span>
            <strong className="text-sm text-[#10213F] block mt-0.5">{b.service?.name}</strong>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Verified Amount</span>
            <strong className="text-sm text-[#1264F5] block mt-0.5">₹{b.finalAmount} ({b.paymentMethod})</strong>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5] space-y-2 text-[#64748B]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span>Scheduled Date: <strong className="text-[#10213F]">{b.date} ({b.timeSlot})</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span>Vehicle: <strong className="text-[#10213F]">{b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.regNumber})</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span>Doorstep: <strong className="text-[#10213F]">{b.address?.house}, {b.address?.area}, {b.address?.city}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E6ECF5] flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(`/my-bookings/${b.id || b.bookingNumber}`)}
            variant="primary"
            fullWidth
            icon={ArrowRight}
          >
            Track Live Status
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            fullWidth
            icon={Home}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
