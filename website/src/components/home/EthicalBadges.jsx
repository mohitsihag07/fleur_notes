import React from 'react';
import { Leaf, Heart, Shield, Star } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ethicalBadges } from '@/data/banners';

const iconMap = {
  Leaf,
  Heart,
  Award: Shield,
  Star
};

export function EthicalBadges() {
  return (
    <section className="py-10 bg-[#FAF5EF] border-t border-[#E8DACD]/60">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ethicalBadges.map((badge, idx) => {
            const Icon = iconMap[badge.icon] || Leaf;
            return (
              <div key={idx} className="flex items-center gap-3 justify-center text-center sm:text-left">
                <div className="p-2.5 rounded-full bg-[#F2E6DA] text-[#7A0C1E] shrink-0 border border-[#E8DACD]">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#2B1B17] leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#705B54] mt-0.5">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
