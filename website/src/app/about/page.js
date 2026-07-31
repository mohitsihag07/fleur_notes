'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Leaf, ShieldCheck, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';
import { Newsletter } from '@/components/home/Newsletter';
import { bannerService } from '@/services/bannerService';
import { cmsService } from '@/services/cmsService';
import { getBackendURL } from '@/services/api';

// Map icon name strings (stored in DB) → Lucide icon components
const ICON_MAP = {
  heart: Heart,
  leaf: Leaf,
  'shield-check': ShieldCheck,
  star: Star,
  sparkles: Sparkles,
  'check-circle': CheckCircle,
  'arrow-right': ArrowRight,
};

// Default fallbacks for About Banner
const BANNER_DEFAULTS = {
  title: 'Handcrafted With Purpose, Curated With Love',
  tagline: 'ABOUT Fleur Notes',
  description: 'We bring warmth, elegance, and intentional design into your everyday spaces through carefully handcrafted home decor, artisanal soy candles, and boutique essentials.',
  image: '/images/categories/decor.jpg',
  primary_cta_text: 'Explore Our Story',
  primary_cta_link: '#values',
};

// Default fallbacks for CMS-managed sections only
const CMS_DEFAULTS = {
  values_section_title: 'More Than Just Products',
  values_section_subtitle: 'OUR VALUES',
  values_section_description: "We believe in the beauty of thoughtful living. That's why every product we create or curate is designed to add meaning, comfort, and elegance to your everyday moments.",
  values_section_image: '/images/categories/gifts.jpg',
  values: [
    'Timeless designs that inspire',
    'Handpicked materials, always',
    'Small batch, maximum care',
    'Made to be loved, made to last',
  ],
  trust_badges: [
    { icon: 'heart', title: 'Handmade with Love', description: 'Every piece is thoughtfully handcrafted with care.' },
    { icon: 'leaf', title: 'Sustainable & Ethical', description: 'We use eco-friendly materials and responsible practices.' },
    { icon: 'shield-check', title: 'Premium Quality', description: 'Quality you can see and feel in every single detail.' },
    { icon: 'star', title: 'Loved by Customers', description: 'Thousands of happy customers trust and love our products.' },
  ],
};


export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  // Hero — from Banners module
  const [banner, setBanner] = useState(BANNER_DEFAULTS);
  // Content sections — from CMS module
  const [cms, setCms] = useState(CMS_DEFAULTS);

  useEffect(() => {
    // Load hero banner from Banners
    async function loadBanner() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 1, type: 'about' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
          let imgUrl = b.image || BANNER_DEFAULTS.image;
          if (imgUrl.includes('localhost:') || imgUrl.includes('127.0.0.1:')) {
            try {
              const urlObj = new URL(imgUrl);
              imgUrl = urlObj.pathname;
            } catch (e) {
              imgUrl = imgUrl.replace(/^https?:\/\/[^\/]+/, '');
            }
          }
          if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
            imgUrl = `${backendUrl}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
          }
          setBanner({
            title: b.title || BANNER_DEFAULTS.title,
            description: b.description || BANNER_DEFAULTS.description,
            tagline: b.tagline || BANNER_DEFAULTS.tagline,
            image: imgUrl,
            primary_cta_text: b.primary_cta_text || b.button_text,
            primary_cta_link: b.primary_cta_link || b.button_link,
            secondary_cta_text: b.secondary_cta_text,
            secondary_cta_link: b.secondary_cta_link,
          });
        }
      } catch (error) {
        console.error('Failed to load about banner:', error);
      }
    }

    // Load values/trust badges from CMS
    async function loadCms() {
      try {
        const data = await cmsService.getCmsPage('about-us');
        if (data) {
          setCms({
            values_section_title: data.values_section_title || CMS_DEFAULTS.values_section_title,
            values_section_subtitle: data.values_section_subtitle || CMS_DEFAULTS.values_section_subtitle,
            values_section_description: data.values_section_description || CMS_DEFAULTS.values_section_description,
            values_section_image: data.values_section_image || CMS_DEFAULTS.values_section_image,
            values: (data.values && data.values.length > 0) ? data.values : CMS_DEFAULTS.values,
            trust_badges: (data.trust_badges && data.trust_badges.length > 0) ? data.trust_badges : CMS_DEFAULTS.trust_badges,
          });
        }
      } catch (error) {
        console.error('Failed to load about CMS content:', error);
      }
    }

    loadBanner();
    loadCms();
    setMounted(true);
  }, []);

  // Avoid hydration mismatch — render nothing until client has mounted
  if (!mounted) return null;

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner — managed from Banners module */}
      <section className="relative overflow-hidden w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title || 'About Banner'}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          {/* Subtle dark gradient overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>
        <Container className="relative z-10 w-full py-10 sm:py-16">
          <div className="max-w-xl md:max-w-2xl flex flex-col items-start space-y-3 sm:space-y-4 text-white">
            {banner.tagline && (
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#FAF5EF] uppercase bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 fill-[#FAF5EF]" />
                <span>{banner.tagline}</span>
              </div>
            )}
            {banner.title && (
              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight drop-shadow-md">
                {banner.title}
              </h1>
            )}
            {banner.description && (
              <p className="text-xs sm:text-base lg:text-lg text-gray-100 font-medium leading-relaxed max-w-xl drop-shadow">
                {banner.description}
              </p>
            )}

            {/* Dynamic CTA Buttons */}
            {(banner.primary_cta_text || banner.secondary_cta_text) && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {banner.primary_cta_text && (
                  <Link href={banner.primary_cta_link || '/shop'}>
                    <Button variant="primary" icon={ArrowRight} iconPosition="right" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white">
                      {banner.primary_cta_text}
                    </Button>
                  </Link>
                )}

                {banner.secondary_cta_text && (
                  <Link href={banner.secondary_cta_link || '#'}>
                    <Button variant="outline" className="rounded-xl px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-xs">
                      {banner.secondary_cta_text}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Trust Badges — managed from CMS module */}
      <section className="py-12 bg-[#FAF5EF] border-b border-[#E8DACD]/60">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cms.trust_badges.map((badge, idx) => {
              const Icon = ICON_MAP[badge.icon] || Heart;
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

      {/* Values Section — managed from CMS module */}
      <section className="py-16 lg:py-24 bg-[#FAF5EF]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#E8DACD]">
              <Image
                src={cms.values_section_image}
                alt="Our Values"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
                <span>{cms.values_section_subtitle}</span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
                {cms.values_section_title}
              </h2>
              <p className="text-sm text-[#705B54] leading-relaxed">
                {cms.values_section_description}
              </p>

              <div className="space-y-3 pt-2">
                {cms.values.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#2B1B17]">
                    <CheckCircle className="w-4 h-4 text-[#3A7D44] shrink-0 fill-[#3A7D44]/10" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A0C1E] hover:underline">
                  <span>Shop Our Collection</span>
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
