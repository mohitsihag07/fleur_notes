'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts } from '@/data/products';

export function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24 bg-[#F2E6DA]/50 border-y border-[#E8DACD]/60">
      <Container>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
              Featured Products
            </h2>
            <p className="text-sm text-[#705B54] mt-1">
              Handpicked customer favorites for your home
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A0C1E] hover:text-[#5F0917] group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
