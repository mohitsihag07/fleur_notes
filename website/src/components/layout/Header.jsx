'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  Heart,
  Menu,
  X,
  HelpCircle,
  RotateCcw,
  Ticket,
  MapPin,
  Bell,
  LogOut
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

export function Header() {
  const { logoUrl, siteName } = useSettings();
  const { isLoggedIn, logout } = useAuth();
  const { cartCount, wishlistCount } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenMenu = () => setMobileMenuOpen(true);
    window.addEventListener('open-mobile-account-menu', handleOpenMenu);
    return () => window.removeEventListener('open-mobile-account-menu', handleOpenMenu);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop', hasDropdown: true },
    { name: 'Categories', href: '/categories', hasDropdown: true },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const profileSidebarLinks = [
    { name: 'My Profile', href: '/profile?tab=profile', icon: User },
    { name: 'Your Orders', href: '/profile?tab=orders', icon: ShoppingBag },
    { name: 'Help & Support', href: '/profile?tab=help', icon: HelpCircle },
    { name: 'Your Refunds', href: '/profile?tab=refunds', icon: RotateCcw },
    { name: 'Coupons', href: '/profile?tab=coupons', icon: Ticket },
    { name: 'Saved Addresses', href: '/profile?tab=addresses', icon: MapPin },
    { name: 'Notifications', href: '/profile?tab=notifications', icon: Bell }
  ];

  return (
    <>
      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-[#FAF5EF]/95 backdrop-blur-md transition-all duration-300 border-b border-[#E8DACD]/60 ${
          isScrolled ? 'shadow-sm py-2.5' : 'py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo (Left) */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#7A0C1E]/10 flex items-center justify-center text-[#7A0C1E] group-hover:scale-105 transition-transform overflow-hidden relative border border-[#A87B39]/30 shrink-0 p-1">
                <img src={logoUrl} alt={siteName || "Logo"} className="w-full h-full object-contain" />
              </div>
              <span className="font-serif-luxury text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#2B1B17]">
                {siteName}
              </span>
            </Link>

            {/* Mobile Search Bar (Middle - displayed on mobile / tablet < lg) */}
            <div className="flex lg:hidden flex-1 max-w-[200px] xs:max-w-xs sm:max-w-sm mx-1 sm:mx-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 bg-[#F2E6DA] hover:bg-[#E8DACD]/80 border border-[#E8DACD] text-[#705B54] rounded-full px-3 py-1.5 text-xs transition-colors shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-[#7A0C1E] shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">Search...</span>
              </button>
            </div>

            {/* Desktop Navigation Links (Middle - displayed on desktop >= lg) */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <div key={link.name} className="relative py-2 group">
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-[#7A0C1E] font-semibold'
                          : 'text-[#2B1B17] hover:text-[#7A0C1E]'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.hasDropdown && (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#7A0C1E] transition-transform group-hover:rotate-180" />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="headerActiveNavUnderline"
                          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#7A0C1E] rounded-full"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              {/* Search button (Desktop only) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex p-2 text-[#2B1B17] hover:text-[#7A0C1E] hover:bg-[#F2E6DA] rounded-full transition-colors cursor-pointer"
                aria-label="Search"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Cart Link (Desktop only) */}
              <Link
                href="/cart"
                className="hidden lg:flex p-2 text-[#2B1B17] hover:text-[#7A0C1E] hover:bg-[#F2E6DA] rounded-full transition-colors relative"
                aria-label="Cart"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="relative"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </motion.div>
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="hidden sm:flex p-1.5 sm:p-2 text-[#2B1B17] hover:text-[#7A0C1E] hover:bg-[#F2E6DA] rounded-full transition-colors"
                  aria-label="Profile"
                >
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <User className="w-5 h-5 text-[#7A0C1E]" />
                  </motion.div>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-[#7A0C1E] text-white hover:bg-[#5F0917] transition-all shadow-xs"
                >
                  Sign In
                </Link>
              )}

              {/* Wishlist Link (Visible on Mobile & Desktop) */}
              <Link
                href="/wishlist"
                className="relative p-1.5 sm:p-2 text-[#2B1B17] hover:text-[#7A0C1E] hover:bg-[#F2E6DA] rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="relative"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer - Account & Support Details Only */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-xs bg-[#FAF5EF] shadow-2xl border-r border-[#E8DACD] p-6 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div className="space-y-6">
                {/* Header with Close */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DACD]/60">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ACCOUNT & SUPPORT
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full hover:bg-[#F2E6DA] text-gray-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Account & Support List Items */}
                <div className="space-y-1">
                  {profileSidebarLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-xs font-bold text-[#7A0C1E] hover:bg-[#F2E6DA] rounded-xl transition-colors"
                      >
                        <Icon className="w-4.5 h-4.5 text-[#7A0C1E] shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Log Out / Sign In Button */}
              <div className="pt-6 border-t border-[#E8DACD]/60">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50/70 text-[#7A0C1E] text-xs font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-3 bg-[#7A0C1E] text-white text-xs font-bold rounded-2xl shadow-xs hover:bg-[#5F0917] transition-all"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Search Bar Modal */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
