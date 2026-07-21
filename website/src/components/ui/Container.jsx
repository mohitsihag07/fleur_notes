import React from 'react';
import clsx from 'clsx';

export function Container({ children, className = '', size = 'default' }) {
  const sizes = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    large: 'max-w-8xl',
    full: 'max-w-full'
  };

  return (
    <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8', sizes[size] || sizes.default, className)}>
      {children}
    </div>
  );
}
