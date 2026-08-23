import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingStars } from '@shared/components/RatingStars';
import { Button } from '@shared/components/Button';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const ServiceCard = ({ service, onSelect, onBook, onViewDetails }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    if (onSelect) {
      onSelect(service);
    } else if (onBook) {
      onBook(service);
    } else {
      navigate(`/booking/${service.id}`);
    }
  };

  const handleDetails = () => {
    if (onViewDetails) {
      onViewDetails(service);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-lg transition-all duration-300 group shadow-xs">
      <div className="relative cursor-pointer" onClick={handleDetails}>
        <img
          src={service.image || service.image_url}
          alt={service.name}
          className="w-full h-44 object-cover group-hover:scale-103 transition-transform duration-500"
        />
        
        {service.badge && (
          <span className="absolute top-3 left-3 bg-[#1264F5] text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {service.badge}
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-bold bg-white/95 backdrop-blur-md text-[#10213F] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-[#E6ECF5]">
            <Clock className="w-3.5 h-3.5 text-[#1264F5]" />
            {service.duration || `${service.duration_minutes || 30} mins`}
          </span>
          <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#E6ECF5] shadow-xs">
            <RatingStars rating={service.rating || 4.8} count={service.reviewsCount || service.reviews_count || 215} size="xs" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={handleDetails}
            className="text-base font-bold text-[#10213F] group-hover:text-[#1264F5] transition-colors cursor-pointer line-clamp-1"
          >
            {service.name}
          </h3>
          <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
            {service.description}
          </p>

          {(service.included || service.included_json) && (
            <div className="mt-3 space-y-1">
              {(service.included || service.included_json).slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#E6ECF5] flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Starting from</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#10213F]">₹{service.price}</span>
              {(service.originalPrice || service.original_price) && (
                <span className="text-xs text-[#94A3B8] line-through">₹{service.originalPrice || service.original_price}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetails}
              className="text-xs font-bold text-[#64748B] hover:text-[#1264F5] px-2 py-1 transition-colors cursor-pointer"
            >
              Details
            </button>
            <Button
              onClick={handleBook}
              variant="primary"
              size="sm"
              icon={ArrowRight}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
