import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export function Rating({ rating = 5, count, size = 'sm', className = '' }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <Star
            key={star}
            className={clsx(
              starSizes[size],
              star <= Math.floor(rating)
                ? 'fill-[#D4A373] text-[#D4A373]'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 font-medium ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
