import React from 'react';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const ServiceCard = ({ service, onSelect, onViewDetails }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 group shadow-lg">
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
        
        {service.badge && (
          <span className="absolute top-3 left-3 bg-cyan-500/90 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
            {service.badge}
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-semibold bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-cyan-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {service.duration}
          </span>
          <RatingStars rating={service.rating} count={service.reviewsCount} size="xs" />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {service.description}
          </p>

          {service.included && (
            <div className="mb-4 space-y-1">
              {service.included.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white">₹{service.price}</span>
              {service.originalPrice && (
                <span className="text-xs text-slate-500 line-through">₹{service.originalPrice}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails && onViewDetails(service)}
              className="text-xs font-semibold text-slate-300 hover:text-cyan-400 px-2 py-1 transition-colors"
            >
              Details
            </button>
            <Button
              onClick={() => onSelect && onSelect(service)}
              variant="primary"
              size="sm"
              icon={ArrowRight}
            >
              Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
