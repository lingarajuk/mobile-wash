import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
import { Calendar, Clock, MapPin, Navigation, Eye, Star } from 'lucide-react';

export const BookingCard = ({ booking, onViewDetails, onTrack, onRate }) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/my-bookings/${booking.id || booking.bookingNumber}`);
  };

  const handleTrackClick = () => {
    navigate(`/my-bookings/${booking.id || booking.bookingNumber}`);
  };

  const stLower = (booking.status || '').toLowerCase();
  const isOnTheWay = stLower === 'on the way' || stLower === 'in progress' || stLower === 'arrived';

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header with ID and Status */}
        <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3 mb-3">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold">Booking ID</span>
            <h4 className="text-sm font-black text-[#1264F5] font-mono">#{booking.bookingNumber || booking.id}</h4>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Main Service Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <img
            src={booking.service?.image || booking.service?.image_url}
            alt={booking.service?.name}
            className="w-16 h-16 rounded-xl object-cover border border-[#E6ECF5] shrink-0"
          />
          <div>
            <h3 className="text-base font-bold text-[#10213F] leading-snug">{booking.service?.name}</h3>
            <p className="text-xs text-[#64748B] font-semibold mt-0.5">
              {booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.regNumber})
            </p>
            <span className="inline-block mt-1 text-xs font-black text-[#10213F]">
              ₹{booking.finalAmount} • <span className="text-[#64748B] font-medium">{booking.paymentMethod}</span>
            </span>
          </div>
        </div>

        {/* Date, Time & Address */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E6ECF5] space-y-1.5 text-xs text-[#64748B] mb-4 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span className="text-[#10213F] font-bold">{booking.date}</span>
            <span className="text-[#CBD5E1]">•</span>
            <Clock className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span>{booking.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#1264F5] shrink-0" />
            <span className="truncate">{booking.address?.area}, {booking.address?.city}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E6ECF5] gap-2">
        <Button
          onClick={handleDetailsClick}
          variant="secondary"
          size="sm"
          icon={Eye}
        >
          View Details & Track
        </Button>

        {isOnTheWay && (
          <Button
            onClick={handleTrackClick}
            variant="primary"
            size="sm"
            icon={Navigation}
          >
            Track Technician
          </Button>
        )}

        {stLower === 'completed' && !booking.review && (
          <Button
            onClick={handleDetailsClick}
            variant="outline"
            size="sm"
            icon={Star}
          >
            Rate Wash
          </Button>
        )}
      </div>
    </div>
  );
};
