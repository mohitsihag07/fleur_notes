'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  Heart
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { heroSlide } from '@/data/banners';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop', hasDropdown: true },
    { name: 'Categories', href: '/categories', hasDropdown: true },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
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
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#7A0C1E]/10 flex items-center justify-center text-[#7A0C1E] group-hover:scale-105 transition-transform overflow-hidden relative border border-[#A87B39]/30 shrink-0">
                <Image src="/images/logo/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="font-serif-luxury text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#2B1B17]">
                Fleur Notes
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
                  <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    2
                  </span>
                </motion.div>
              </Link>

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
                  <User className="w-5 h-5" />
                </motion.div>
              </Link>

              {/* Wishlist Link (Visible on Mobile) */}
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
                  <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    3
                  </span>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Search Bar Modal */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
