'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { categories as staticCategories } from '@/data/categories';
import { categoryService } from '@/services/categoryService';
import { getBackendURL } from '@/services/api';

export function Categories() {
  const [categoriesList, setCategoriesList] = useState(staticCategories);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getCategories({ limit: 8 });
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
              linkText: 'Shop Now'
            };
          });
          setCategoriesList(formatted);
        }
      } catch (err) {
        console.error('Failed to load home categories:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#FAF5EF]">
      <Container>
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
            Shop by Category
          </h2>
          <p className="text-sm text-[#705B54] mt-2">
            Explore our curated collections of artisanal home goods & gifts
          </p>
        </div>

        {/* Desktop Card Grid (Hidden on Mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/categories`} className="group block">
                <div className="bg-[#F2E6DA] rounded-2xl overflow-hidden border border-[#E8DACD] shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1200px) 50vw, 300px"
                    />
                  </div>
                  <div className="p-5 flex flex-col items-start bg-white">
                    <h3 className="font-semibold text-base text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors">
                      {cat.name}
                    </h3>
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-[#7A0C1E] mt-1 group-hover:translate-x-1 transition-transform">
                      <span>{cat.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Circular Avatars Grid (Visible only on Mobile) */}
        <div className="grid grid-cols-4 gap-3 sm:hidden">
          {categoriesList.map((cat) => (
            <Link key={cat.id} href="/categories" className="flex flex-col items-center group">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8DACD] shadow-sm group-hover:border-[#7A0C1E] transition-colors">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium text-[#2B1B17] text-center mt-2 line-clamp-1">
                {cat.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
