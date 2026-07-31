'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useShop } from '@/context/ShopContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useShop();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Categories', href: '/categories', icon: LayoutGrid },
    { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { name: 'Account', href: '/profile', icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EF]/95 backdrop-blur-md border-t border-[#E8DACD] py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.name === 'Account' && pathname?.startsWith('/profile')) {
                  window.dispatchEvent(new CustomEvent('open-mobile-account-menu'));
                }
              }}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium py-1.5 px-3 rounded-xl relative transition-colors duration-200 select-none"
              style={{ color: isActive ? '#7A0C1E' : '#6B7280' }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveBg"
                  className="absolute inset-0 bg-[#F2E6DA] border border-[#E8DACD]/60 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="relative z-10"
              >
                <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#7A0C1E] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-90 z-20">
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span className="relative z-10 text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
