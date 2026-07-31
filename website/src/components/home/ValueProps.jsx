'use client';

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/utils/formatPrice';

const iconMap = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones
};

export function ValueProps() {
  const { freeShippingThreshold, flatShippingRate, enableFreeShipping } = useSettings();

  return (
    <section className="py-8 bg-[#FAF5EF] border-b border-[#E8DACD]/60">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {valueProps.map((item, idx) => {
            const Icon = iconMap[item.icon] || Truck;
            let subtitleText = item.subtitle;

            if (item.title === 'Free Shipping' || item.icon === 'Truck') {
              if (enableFreeShipping) {
                subtitleText = `On orders over ${formatPrice(freeShippingThreshold)}`;
              } else {
                subtitleText = `Flat shipping ${formatPrice(flatShippingRate)}`;
              }
            }

            return (
              <div key={idx} className="flex items-center gap-3 md:justify-center">
                <div className="p-2.5 rounded-full bg-[#F2E6DA] text-[#7A0C1E] shrink-0 border border-[#E8DACD]">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#2B1B17] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#705B54] mt-0.5">
                    {subtitleText}
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
