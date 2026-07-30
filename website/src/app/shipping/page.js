'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, Clock, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useSettings } from '@/context/SettingsContext';

export default function ShippingPage() {
  const { freeShippingThreshold, flatShippingRate, contactEmail } = useSettings();

  return (
    <div className="bg-[#FAF5EF] min-h-screen pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden w-full py-12 sm:py-16 border-b border-[#E8DACD]/60 bg-[#F2E6DA]/50">
        <Container>
          <div className="max-w-3xl space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#7A0C1E] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase bg-white/70 px-3.5 py-1 rounded-full border border-[#E8DACD]">
              <Truck className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>CUSTOMER CARE</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#2B1B17] tracking-tight">
              Shipping & Delivery
            </h1>

            <p className="text-sm sm:text-base text-[#705B54] leading-relaxed">
              We carefully craft, pack, and ship every order to ensure your items arrive safely at your doorstep.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E8DACD] rounded-3xl p-6 shadow-xs space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B1B17]">Standard Shipping</h3>
              <p className="text-xs text-[#705B54]">Flat rate of ₹{flatShippingRate} on standard orders.</p>
            </div>

            <div className="bg-white border border-[#E8DACD] rounded-3xl p-6 shadow-xs space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B1B17]">Free Delivery</h3>
              <p className="text-xs text-[#705B54]">Free standard shipping on orders over ₹{freeShippingThreshold}.</p>
            </div>

            <div className="bg-white border border-[#E8DACD] rounded-3xl p-6 shadow-xs space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B1B17]">Processing Time</h3>
              <p className="text-xs text-[#705B54]">Dispatched within 1–3 business days from order placement.</p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="bg-white border border-[#E8DACD] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">1. Processing & Handling</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                All orders are processed and shipped Monday through Friday, excluding public holidays. Orders placed over the weekend or on public holidays will begin processing on the following business day.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">2. Delivery Timelines</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                Standard domestic shipments typically arrive within 3–7 business days depending on your location. You will receive an automated tracking link via email as soon as your package ships.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">3. Address Accuracy</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                Please verify your shipping address at checkout. We are not responsible for shipments delivered to incorrect or incomplete addresses supplied during order checkout.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DACD]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705B54]">
              <span>Have questions about your order tracking?</span>
              <Link href="/contact" className="font-bold text-[#7A0C1E] hover:underline">
                Contact Customer Support →
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
