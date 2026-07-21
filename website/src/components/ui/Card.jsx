import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', hoverEffect = true }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-[#E7DDD4]/70 overflow-hidden transition-all duration-300',
        hoverEffect && 'hover:shadow-md hover:border-[#C98B6B]/40',
        className
      )}
    >
      {children}
    </div>
  );
}
