import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Calendar, Clock, MapPin, Navigation, Eye, Star } from 'lucide-react';

export const BookingCard = ({ booking, onViewDetails, onTrack, onRate }) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between shadow-lg">
      <div>
        {/* Header with ID and Status */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Booking ID</span>
            <h4 className="text-sm font-extrabold text-cyan-400 font-mono">{booking.id}</h4>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Main Service Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <img
            src={booking.service.image}
            alt={booking.service.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{booking.service.name}</h3>
            <p className="text-xs text-slate-300 font-medium">
              {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.regNumber})
            </p>
            <span className="inline-block mt-1 text-[11px] font-bold text-cyan-300">
              ₹{booking.finalAmount} • {booking.paymentMethod}
            </span>
          </div>
        </div>

        {/* Date, Time & Address */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{booking.date}</span>
            <span className="text-slate-600">•</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{booking.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{booking.address.area}, {booking.address.city}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
        <Button
          onClick={() => onViewDetails(booking)}
          variant="secondary"
          size="sm"
          icon={Eye}
        >
          Details
        </Button>

        {booking.status === 'Ongoing' && (
          <Button
            onClick={() => onTrack(booking)}
            variant="primary"
            size="sm"
            icon={Navigation}
            className="shadow-lg shadow-cyan-500/20"
          >
            Track Live
          </Button>
        )}

        {booking.status === 'Completed' && !booking.review && (
          <Button
            onClick={() => onRate(booking)}
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
