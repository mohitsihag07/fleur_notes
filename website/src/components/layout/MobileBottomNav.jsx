'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, LayoutGrid, Heart, User } from 'lucide-react';
import clsx from 'clsx';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Categories', href: '/categories', icon: LayoutGrid },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Account', href: '/profile', icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EF]/95 backdrop-blur-md border-t border-[#E8DACD] py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 text-[11px] font-medium transition-all duration-200 py-1 px-2 rounded-lg',
                isActive
                  ? 'text-[#7A0C1E] font-semibold scale-105'
                  : 'text-gray-500 hover:text-[#2B1B17]'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5px] text-[#7A0C1E]')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
