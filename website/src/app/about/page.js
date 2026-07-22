'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Leaf, ShieldCheck, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';
import { Newsletter } from '@/components/home/Newsletter';
import { bannerService } from '@/services/bannerService';
import { getBackendURL } from '@/services/api';

export default function AboutPage() {
  const [banner, setBanner] = useState({
    title: 'Crafted with love, chosen for you.',
    description: 'Fleur Notes was born from a simple idea — to bring beauty, warmth, and meaning into everyday life. We curate and create handcrafted products that tell a story and turn houses into homes.',
    tagline: 'OUR STORY',
    image: '/images/banners/hero_banner.jpg'
  });

  useEffect(() => {
    async function loadBanner() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 1, type: 'about' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
          let imgUrl = b.image || '/images/banners/hero_banner.jpg';
          if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
            const path = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            imgUrl = `${backendUrl}${path}`;
          }
          setBanner({
            title: b.title || 'Crafted with love, chosen for you.',
            description: b.description || 'Fleur Notes was born from a simple idea — to bring beauty, warmth, and meaning into everyday life. We curate and create handcrafted products that tell a story and turn houses into homes.',
            tagline: b.tagline || 'OUR STORY',
            image: imgUrl
          });
        }
      } catch (error) {
        console.error('Failed to load about banner:', error);
      }
    }
    loadBanner();
  }, []);

  const values = [
    'Timeless designs that inspire',
    'Handpicked materials, always',
    'Small batch, maximum care',
    'Made to be loved, made to last'
  ];

  const trustBadges = [
    {
      icon: Heart,
      title: 'Handmade with Love',
      description: 'Every piece is thoughtfully handcrafted with care.'
    },
    {
      icon: Leaf,
      title: 'Sustainable & Ethical',
      description: 'We use eco-friendly materials and responsible practices.'
    },
    {
      icon: ShieldCheck,
      title: 'Premium Quality',
      description: 'Quality you can see and feel in every single detail.'
    },
    {
      icon: Star,
      title: 'Loved by Customers',
      description: 'Thousands of happy customers trust and love our products.'
    }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner (Full Screen Width) */}
      <section className="relative overflow-hidden w-full h-[70vh] sm:h-[80vh] min-h-[580px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>

        {/* Hero Content (Layered directly over the banner) */}
        <Container className="relative z-10 w-full">
          <div className="max-w-xl md:max-w-2xl flex flex-col items-start space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>{banner.tagline}</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#7A0C1E] leading-[1.15] tracking-tight">
              {banner.title}
            </h1>
            <p className="text-base sm:text-lg text-black font-medium leading-relaxed max-w-xl">
              {banner.description}
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button variant="primary" icon={ArrowRight} iconPosition="right" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917]">
                  Our Collection
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Badges 4 Cards Row */}
      <section className="py-12 bg-[#FAF5EF] border-b border-[#E8DACD]/60">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="bg-[#F2E6DA]/50 border border-[#E8DACD] rounded-2xl p-6 flex flex-col items-start space-y-3">
                  <div className="p-3 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shadow-xs">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="font-semibold text-sm text-[#2B1B17]">{badge.title}</h3>
                  <p className="text-xs text-[#705B54] leading-relaxed">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Our Values Section */}
      <section className="py-16 lg:py-24 bg-[#FAF5EF]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photography Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#E8DACD]">
              <Image
                src="/images/categories/gifts.jpg"
                alt="Artisanal Handcrafting"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Story Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
                <span>OUR VALUES</span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
                More Than Just Products
              </h2>
              <p className="text-sm text-[#705B54] leading-relaxed">
                We believe in the beauty of thoughtful living. That's why every product we create or curate is designed to add meaning, comfort, and elegance to your everyday moments.
              </p>

              <div className="space-y-3 pt-2">
                {values.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#2B1B17]">
                    <CheckCircle className="w-4 h-4 text-[#3A7D44] shrink-0 fill-[#3A7D44]/10" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/about" className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A0C1E] hover:underline">
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
