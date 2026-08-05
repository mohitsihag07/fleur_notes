'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/ui/Container';
import { bannerService } from '@/services/bannerService';
import { getBackendURL } from '@/services/api';

export function Hero() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 10, type: 'home' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const backendUrl = getBackendURL();
          const mapped = fetchedBanners.map((b) => {
            let imgUrl = b.image || '';
            if (imgUrl.includes('localhost:') || imgUrl.includes('127.0.0.1:')) {
              try {
                const urlObj = new URL(imgUrl);
                imgUrl = urlObj.pathname;
              } catch (e) {
                imgUrl = imgUrl.replace(/^https?:\/\/[^\/]+/, '');
              }
            }
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
              const path = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
              imgUrl = `${backendUrl}${path}`;
            }
            return {
              tagline: b.tagline || '',
              title: b.title || '',
              description: b.description || '',
              primaryCta: b.primary_cta_text || 'Shop Now',
              primaryCtaLink: b.primary_cta_link || '/shop',
              secondaryCta: b.secondary_cta_text || 'Explore Collection',
              secondaryCtaLink: b.secondary_cta_link || '/categories',
              image: imgUrl
            };
          });
          setSlides(mapped);
        }
      } catch (error) {
        console.error('Failed to load banners from backend:', error);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const handlePrev = () => {
    if (!slides || slides.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (!slides || slides.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const slide = slides[currentIndex] || slides[0];

  return (
    <section className="relative overflow-hidden w-full h-[35vh] sm:h-[48vh] lg:h-[55vh] min-h-[260px] lg:min-h-[400px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
      {/* Background Banner Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Content (Layered directly over the banner) */}
      <Container className="relative z-20 w-full flex justify-start items-center">
        <div className="w-full max-w-xl md:max-w-2xl py-6 sm:py-12 md:py-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start space-y-2 sm:space-y-6"
            >
              {/* Tagline */}
              {slide.tagline && (
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase">
                  <Heart className="w-3 h-3 fill-[#7A0C1E] text-[#7A0C1E]" />
                  <span>{slide.tagline}</span>
                  <Heart className="w-3 h-3 fill-[#7A0C1E] text-[#7A0C1E]" />
                </div>
              )}

              {/* Title */}
              <h1 className="font-serif-luxury text-2xl sm:text-5xl lg:text-6xl font-bold text-[#7A0C1E] leading-[1.15] tracking-tight">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-base lg:text-lg text-black font-medium leading-normal sm:leading-relaxed max-w-xl">
                {slide.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={slide.primaryCtaLink || '/shop'}>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="rounded-md font-medium text-sm px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917]"
                  >
                    {slide.primaryCta}
                  </Button>
                </Link>

                <Link href={slide.secondaryCtaLink || '/categories'}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-md font-medium text-sm px-6 py-3 border-[#7A0C1E] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white"
                  >
                    {slide.secondaryCta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>

      {/* Manual Slide Controls - Left Arrow */}
      {slides.length > 1 && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center rounded-full bg-[#FAF5EF]/80 hover:bg-[#7A0C1E] text-[#7A0C1E] hover:text-white border border-[#E8DACD] shadow-md transition-all duration-300 cursor-pointer focus:outline-hidden hover:translate-x-[-2px]"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Manual Slide Controls - Right Arrow */}
      {slides.length > 1 && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center rounded-full bg-[#FAF5EF]/80 hover:bg-[#7A0C1E] text-[#7A0C1E] hover:text-white border border-[#E8DACD] shadow-md transition-all duration-300 cursor-pointer focus:outline-hidden hover:translate-x-[2px]"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 cursor-pointer focus:outline-hidden ${
                index === currentIndex
                  ? 'w-8 h-2 rounded-full bg-[#7A0C1E]'
                  : 'w-2 h-2 rounded-full bg-gray-400/50 hover:bg-[#7A0C1E]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
