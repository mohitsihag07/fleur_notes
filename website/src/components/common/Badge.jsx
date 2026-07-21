import React from 'react';
import clsx from 'clsx';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#F2E6DA] text-[#7A0C1E]',
    primary: 'bg-[#7A0C1E] text-white',
    crimson: 'bg-[#7A0C1E] text-white',
    gold: 'bg-[#A87B39] text-white',
    accent: 'bg-[#A87B39] text-white',
    success: 'bg-[#3A7D44]/10 text-[#3A7D44]',
    outline: 'border border-[#E8DACD] text-[#2B1B17]'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
