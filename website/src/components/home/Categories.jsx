'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { categoryService } from '@/services/categoryService';
import { getBackendURL } from '@/services/api';

export function Categories() {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getCategories({ limit: 8 });
        if (cats && cats.length > 0) {
          const backendUrl = getBackendURL();
          const formatted = cats.map((c, idx) => {
            let img = c.image || '';
            if (img && !img.startsWith('http') && !img.startsWith('data:')) {
              if (img.startsWith('/images/') || img.startsWith('images/')) {
                const path = img.startsWith('/') ? img : `/${img}`;
                img = `${backendUrl}${path}`;
              } else {
                const clean = img.startsWith('/') ? img.substring(1) : img;
                img = `${backendUrl}/images/categories/${clean}`;
              }
            }
            return {
              id: c._id || c.id || `cat-${idx}`,
              name: c.name,
              slug: c.slug || c._id || c.id,
              image: img,
            };
          });
          setCategoriesList(formatted);
        } else {
          setCategoriesList([]);
        }
      } catch (err) {
        console.error('Failed to load home categories:', err);
        setCategoriesList([]);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="py-14 md:py-20 bg-[#FAF5EF]">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
            <span>COLLECTIONS</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-[#7A0C1E] mx-auto rounded-full" />
        </div>

        {/* Circle Grid */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-[#E8DACD]/60 animate-pulse" />
                <div className="w-14 h-3 bg-[#E8DACD]/60 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8 lg:gap-10">
            {categoriesList.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2.5 group"
                >
                  {/* Circle image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-[3px] border-[#E8DACD] group-hover:border-[#7A0C1E] transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="112px"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#7A0C1E]/0 group-hover:bg-[#7A0C1E]/20 transition-all duration-300 rounded-full" />
                  </div>

                  {/* Label */}
                  <span className="text-xs sm:text-sm font-semibold text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors text-center max-w-[90px] leading-tight">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
