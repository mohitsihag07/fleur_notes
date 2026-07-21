'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/ui/Container';
import { heroSlide } from '@/data/banners';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#FAF5EF] py-12 md:py-20 border-b border-[#E8DACD]/40">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 flex flex-col items-start space-y-6"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase">
              <Heart className="w-3.5 h-3.5 fill-[#7A0C1E] text-[#7A0C1E]" />
              <span>{heroSlide.tagline}</span>
              <Heart className="w-3.5 h-3.5 fill-[#7A0C1E] text-[#7A0C1E]" />
            </div>

            {/* Title */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B1B17] leading-[1.15] tracking-tight">
              {heroSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#705B54] leading-relaxed max-w-xl font-normal">
              {heroSlide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="rounded-md font-medium text-sm px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917]"
                >
                  {heroSlide.primaryCta}
                </Button>
              </Link>

              <Link href="/categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-md font-medium text-sm px-6 py-3 border-[#7A0C1E] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white"
                >
                  {heroSlide.secondaryCta}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Image Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#E8DACD]">
              <Image
                src={heroSlide.image}
                alt="Fleur Notes luxury artisanal homeware"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
            </div>

            {/* Mobile Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4 lg:hidden absolute -bottom-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7A0C1E]" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
