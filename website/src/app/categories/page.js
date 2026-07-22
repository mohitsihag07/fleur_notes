'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Flame, Gift, ShoppingBag, Utensils, Image as ImageIcon, Sprout, Box } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Newsletter } from '@/components/home/Newsletter';
import { categories as staticCategories } from '@/data/categories';
import { bannerService } from '@/services/bannerService';
import { categoryService } from '@/services/categoryService';
import { getBackendURL } from '@/services/api';

const iconMap = {
  Sparkles,
  Flame,
  Gift,
  ShoppingBag,
  Utensils,
  Image: ImageIcon,
  Sprout,
  Box
};

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState(staticCategories);
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
            image: imgUrl
          });
        }

        // Fetch Real Categories from Backend API
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
              id: c.id,
              name: c.name,
              slug: c.slug,
              image: img,
              itemCount: c.products_count || c.itemCount || '10+',
              icon: 'Sparkles'
            };
          });
          setCategoriesList(formatted);
        }
      } catch (error) {
        console.error('Failed to load categories page data:', error);
      }
    }
    loadData();
  }, []);

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
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#7A0C1E] tracking-tight leading-tight">
              {banner.title}
            </h1>
            <p className="text-base sm:text-lg text-black font-medium leading-relaxed max-w-lg">
              {banner.description}
            </p>
          </div>
        </Container>
      </section>

      {/* 8 Category Grid */}
      <section className="py-16 bg-[#FAF5EF]">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesList.map((cat, idx) => {
              const Icon = iconMap[cat.icon] || Sparkles;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/shop?category=${cat.slug}`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8DACD] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                      {/* Image Container */}
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

                      {/* Details Footer */}
                      <div className="p-5 flex items-center gap-3 bg-white flex-1">
                        <div className="p-2.5 rounded-full bg-[#F2E6DA] text-[#7A0C1E] shrink-0 border border-[#E8DACD]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] text-[#705B54] font-medium">
                            {cat.itemCount} Products
                          </p>
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A0C1E] mt-1 group-hover:translate-x-1 transition-transform">
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
        </Container>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
