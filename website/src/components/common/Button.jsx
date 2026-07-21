'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, accent, icon
  size = 'md', // sm, md, lg
  className = '',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'right',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-300 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[#7A0C1E] hover:bg-[#5F0917] text-white focus:ring-[#7A0C1E] shadow-sm hover:shadow',
    secondary: 'bg-[#F2E6DA] hover:bg-[#E4D4C5] text-[#2B1B17] focus:ring-[#A87B39]',
    outline: 'border border-[#7A0C1E] text-[#7A0C1E] bg-transparent hover:bg-[#7A0C1E] hover:text-white focus:ring-[#7A0C1E]',
    ghost: 'bg-transparent text-[#2B1B17] hover:bg-[#F2E6DA] focus:ring-gray-400',
    accent: 'bg-[#A87B39] hover:bg-[#8C6228] text-white focus:ring-[#A87B39] shadow-sm',
    icon: 'p-2 rounded-full hover:bg-black/5 text-[#2B1B17]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3 gap-2.5',
    icon: 'p-2'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      whileHover={{ y: disabled || isLoading ? 0 : -1 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        variant !== 'icon' && sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
        </>
      )}
    </motion.button>
  );
}
