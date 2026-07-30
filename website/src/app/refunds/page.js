'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, ShieldCheck, CheckCircle2, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useSettings } from '@/context/SettingsContext';

export default function RefundsPage() {
  const { contactEmail } = useSettings();

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
              <RotateCcw className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>CUSTOMER GUARANTEE</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#2B1B17] tracking-tight">
              Returns & Refunds
            </h1>

            <p className="text-sm sm:text-base text-[#705B54] leading-relaxed">
              Your satisfaction is our priority. If you're not completely in love with your purchase, we're here to help make it right.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Detailed Policy Card */}
          <div className="bg-white border border-[#E8DACD] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">1. Return Eligibility Window</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                Items can be returned within 30 days of delivery. To be eligible for a return, products must be unused, in their original condition, and accompanied by the original receipt or proof of purchase.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">2. How to Initiate a Return</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                To start a return, please reach out to our team at <strong className="text-[#2B1B17]">{contactEmail || 'hello@caflore.com'}</strong> with your order number and reason for return. Our support team will guide you with return authorization instructions and shipping guidance.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">3. Refund Processing</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed automatically back to your original payment method within 5–7 business days.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#2B1B17]">4. Damaged or Faulty Products</h2>
              <p className="text-xs sm:text-sm text-[#705B54] leading-relaxed">
                If your order arrives damaged or defective, please contact us within 48 hours of receipt with photos of the damage. We will immediately dispatch a free replacement or issue a full refund.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DACD]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705B54]">
              <span>Need assistance with a return?</span>
              <Link href="/contact" className="font-bold text-[#7A0C1E] hover:underline">
                Start a Return Inquiry →
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
