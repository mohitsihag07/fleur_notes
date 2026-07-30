'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Flame, Gift, ShoppingBag,
  Utensils, Image as ImageIcon, Sprout, Box, Star, Zap, TrendingUp
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Newsletter } from '@/components/home/Newsletter';
import { categories as staticCategories } from '@/data/categories';
import { bannerService } from '@/services/bannerService';
import { categoryService } from '@/services/categoryService';
import { getBackendURL } from '@/services/api';

const iconMap = {
  Sparkles, Flame, Gift, ShoppingBag, Utensils,
  Image: ImageIcon, Sprout, Box
};

// Shop-by-type cards — link to /shop?type=xxx
const TYPE_CARDS = [
  {
    id: 'featured',
    name: 'Featured',
    description: 'Editor\'s top picks',
    icon: Star,
    color: '#7A0C1E',
    bg: '#FAF5EF',
    href: '/shop?type=featured',
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    description: 'Just landed in store',
    icon: Zap,
    color: '#7A0C1E',
    bg: '#FAF5EF',
    href: '/shop?type=new-arrivals',
  },
  {
    id: 'bestsellers',
    name: 'Bestsellers',
    description: 'Most loved by customers',
    icon: TrendingUp,
    color: '#7A0C1E',
    bg: '#FAF5EF',
    href: '/shop?type=bestsellers',
  },
];

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({
    title: 'Explore Our Categories',
    description: 'Handpicked collections crafted with love, just for you.',
    tagline: 'BROWSE CATEGORIES',
    image: '/images/banners/hero_banner.jpg'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 1, type: 'categories' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
          let imgUrl = b.image || '/images/banners/hero_banner.jpg';
          if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
            const path = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            imgUrl = `${backendUrl}${path}`;
          }
          setBanner({
            title: b.title || 'Explore Our Categories',
            description: b.description || 'Handpicked collections crafted with love, just for you.',
            tagline: b.tagline || 'BROWSE CATEGORIES',
            image: imgUrl,
            primary_cta_text: b.primary_cta_text || b.button_text,
            primary_cta_link: b.primary_cta_link || b.button_link,
            secondary_cta_text: b.secondary_cta_text,
            secondary_cta_link: b.secondary_cta_link,
          });
        }

        const cats = await categoryService.getCategories({ limit: 20 });
        if (cats && cats.length > 0) {
          const backendUrl = getBackendURL();
          const formatted = cats.map((c) => {
            let img = c.image || '';
            if (!img) {
              const nameLower = (c.name || '').toLowerCase();
              if (nameLower.includes('bouquet') || nameLower.includes('flower')) img = '/images/categories/home_decor.jpg';
              else if (nameLower.includes('combo')) img = '/images/categories/accessories.jpg';
              else if (nameLower.includes('candle')) img = '/images/categories/candles.jpg';
              else if (nameLower.includes('hamper') || nameLower.includes('gift')) img = '/images/categories/gifts.jpg';
              else img = '/images/categories/home_decor.jpg';
            } else if (!img.startsWith('http') && !img.startsWith('data:')) {
              if (img.startsWith('/images/') || img.startsWith('images/')) {
                const path = img.startsWith('/') ? img : `/${img}`;
                img = `${backendUrl}${path}`;
              } else {
                const clean = img.startsWith('/') ? img.substring(1) : img;
                img = `${backendUrl}/images/categories/${clean}`;
              }
            }
            return {
              id: c._id || c.id,
              name: c.name,
              slug: c.slug || c._id || c.id,
              image: img,
              itemCount: c.products_count || c.itemCount || '10+',
              icon: 'Sparkles'
            };
          });
          setCategoriesList(formatted);
        } else {
          setCategoriesList(staticCategories);
        }
      } catch (error) {
        console.error('Failed to load categories page data:', error);
        setCategoriesList(staticCategories);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image src={banner.image} alt={banner.title || 'Categories Banner'} fill unoptimized className="object-cover" priority />
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
              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                {banner.title}
              </h1>
            )}
            {banner.description && (
              <p className="text-xs sm:text-base lg:text-lg text-gray-100 font-medium leading-normal sm:leading-relaxed max-w-lg drop-shadow">
                {banner.description}
              </p>
            )}

            {/* Dynamic CTAs */}
            {(banner.primary_cta_text || banner.secondary_cta_text) && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {banner.primary_cta_text && (
                  <Link href={banner.primary_cta_link || '/shop'}>
                    <Button variant="primary" icon={Sparkles} iconPosition="right" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white">
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

      {/* ── Shop by Type ── */}
      <section className="pt-14 pb-6 bg-[#FAF5EF]">
        <Container>
          <div className="mb-7 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#7A0C1E]" />
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#2B1B17]">Shop by Type</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TYPE_CARDS.map((type, idx) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                >
                  <Link href={type.href} className="group block h-full">
                    <div className="flex items-center gap-4 bg-white border border-[#E8DACD] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#7A0C1E]/40 transition-all duration-300 h-full">
                      <div className="p-3.5 rounded-2xl shrink-0" style={{ backgroundColor: '#FAF5EF' }}>
                        <Icon className="w-6 h-6 text-[#7A0C1E]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors">
                          {type.name}
                        </h3>
                        <p className="text-[11px] text-[#705B54] font-medium mt-0.5">{type.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#7A0C1E] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-10 bg-[#FAF5EF]">
        <Container>
          <div className="mb-7 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#7A0C1E]" />
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#2B1B17]">Shop by Category</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl bg-[#E8DACD]/40 animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoriesList.map((cat, idx) => {
                const Icon = iconMap[cat.icon] || Sparkles;
                return (
                  <motion.div
                    key={cat.id || cat._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/shop?category=${cat.slug}`} className="group block h-full">
                      <div className="bg-white rounded-2xl overflow-hidden border border-[#E8DACD] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:border-[#7A0C1E]/40">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF5EF]">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 1200px) 50vw, 300px"
                          />
                        </div>

                        {/* Footer */}
                        <div className="p-4 flex items-center gap-3 bg-white flex-1">
                          <div className="p-2 rounded-full bg-[#F2E6DA] text-[#7A0C1E] shrink-0 border border-[#E8DACD]">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors truncate">
                              {cat.name}
                            </h3>
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A0C1E] mt-0.5 group-hover:translate-x-1 transition-transform">
                              <span>Shop Now</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <Newsletter />
    </div>
  );
}
