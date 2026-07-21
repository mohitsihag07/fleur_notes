'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { categories } from '@/data/categories';

export function Categories() {
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
          {categories.map((cat, idx) => (
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
          {categories.map((cat) => (
            <Link key={cat.id} href="/categories" className="flex flex-col items-center group">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8DACD] shadow-sm group-hover:border-[#7A0C1E] transition-colors">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
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
