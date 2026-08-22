import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5, max = 5, size = 'sm', showValue = true, count = null, className = '' }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size] || 'w-4 h-4';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <Star
            key={star}
            className={`${starSizes} ${
              star <= Math.floor(rating)
                ? 'text-amber-400 fill-amber-400'
                : star - 0.5 <= rating
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-slate-600 fill-slate-800'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-slate-200 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
};
