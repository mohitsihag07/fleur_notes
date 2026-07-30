'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const TYPE_CARDS = [
  {
    id: 'featured',
    name: 'Featured',
    description: "Editor's top picks",
    icon: Star,
    href: '/shop?type=featured',
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    description: 'Just landed in store',
    icon: Zap,
    href: '/shop?type=new-arrivals',
  },
  {
    id: 'bestsellers',
    name: 'Bestsellers',
    description: 'Most loved by customers',
    icon: TrendingUp,
    href: '/shop?type=bestsellers',
  },
];

export function ShopByType() {
  return (
    <section className="pt-14 pb-2 bg-[#FAF5EF]">
      <Container>
        <div className="mb-5 flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-[#7A0C1E]" />
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#2B1B17]">
            Shop by Type
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TYPE_CARDS.map((type, idx) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <Link href={type.href} className="group block h-full">
                  <div className="flex items-center gap-4 bg-white border border-[#E8DACD] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#7A0C1E]/40 transition-all duration-300 h-full cursor-pointer">
                    <div className="p-3 rounded-2xl bg-[#FAF5EF] shrink-0">
                      <Icon className="w-5 h-5 text-[#7A0C1E]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-[#2B1B17] group-hover:text-[#7A0C1E] transition-colors">
                        {type.name}
                      </h3>
                      <p className="text-[11px] text-[#705B54] font-medium mt-0.5">
                        {type.description}
                      </p>
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
  );
}
