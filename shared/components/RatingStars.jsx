import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5, max = 5, size = 'sm', showValue = true, count = null, className = '' }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size] || 'w-3.5 h-3.5';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <Star
            key={star}
            className={`${starSizes} ${
              star <= Math.floor(rating)
                ? 'text-[#F59E0B] fill-[#F59E0B]'
                : star - 0.5 <= rating
                ? 'text-[#F59E0B] fill-[#FDE68A]'
                : 'text-[#CBD5E1] fill-[#F1F5F9]'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-[#10213F] ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-[#64748B]">({count})</span>
      )}
    </div>
  );
};
