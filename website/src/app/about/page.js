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

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  // Hero — from Banners module
  const [banner, setBanner] = useState(null);
  // Content sections — from CMS module
  const [cms, setCms] = useState(null);

  useEffect(() => {
    // Load hero banner from Banners
    async function loadBanner() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 1, type: 'about' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
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
            imgUrl = `${backendUrl}${imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`}`;
          }
          setBanner({
            title: b.title || '',
            description: b.description || '',
            tagline: b.tagline || '',
            image: imgUrl,
            primary_cta_text: b.primary_cta_text || b.button_text || '',
            primary_cta_link: b.primary_cta_link || b.button_link || '',
            secondary_cta_text: b.secondary_cta_text || '',
            secondary_cta_link: b.secondary_cta_link || '',
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
            values_section_title: data.values_section_title || '',
            values_section_subtitle: data.values_section_subtitle || '',
            values_section_description: data.values_section_description || '',
            values_section_image: data.values_section_image || '',
            values: data.values || [],
            trust_badges: data.trust_badges || [],
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
      {banner && (
        <section className="relative overflow-hidden w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
          {banner.image && (
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
          )}
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
      )}

      {/* Trust Badges — managed from CMS module */}
      {cms?.trust_badges && cms.trust_badges.length > 0 && (
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
      )}

      {/* Values Section — managed from CMS module */}
      {cms && (cms.values_section_title || cms.values_section_image) && (
        <section className="py-16 lg:py-24 bg-[#FAF5EF]">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Image */}
              {cms.values_section_image && (
                <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#E8DACD]">
                  <Image
                    src={cms.values_section_image}
                    alt="Our Values"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}

              {/* Right Content */}
              <div className="lg:col-span-6 space-y-6">
                {cms.values_section_subtitle && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase">
                    <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
                    <span>{cms.values_section_subtitle}</span>
                  </div>
                )}
                {cms.values_section_title && (
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
                    {cms.values_section_title}
                  </h2>
                )}
                {cms.values_section_description && (
                  <p className="text-sm text-[#705B54] leading-relaxed">
                    {cms.values_section_description}
                  </p>
                )}

                {cms.values && cms.values.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {cms.values.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#2B1B17]">
                        <CheckCircle className="w-4 h-4 text-[#3A7D44] shrink-0 fill-[#3A7D44]/10" />
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                )}

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
      )}

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
