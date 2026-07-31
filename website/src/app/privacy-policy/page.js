'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { cmsService } from '@/services/cmsService';

const DEFAULT_PRIVACY = {
  title: 'Privacy Policy',
  description: `At Fleur Notes, your privacy is extremely important to us. This Privacy Policy document outlines the types of personal information that is received and collected by Fleur Notes and how it is used.

We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your name, e-mail address, mailing address, phone number or payment details.

Any of the information we collect from you may be used in one of the following ways:
• To personalize your experience and respond to individual needs.
• To improve our website offerings based on the information and feedback we receive.
• To improve customer service and support needs efficiently.
• To process transactions securely and deliver purchased products.

We implement a variety of security measures to maintain the safety of your personal information when you place an order or access your account. We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.`,
  image: null,
};

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);
  const [cmsData, setCmsData] = useState(DEFAULT_PRIVACY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCms() {
      try {
        const data = await cmsService.getCmsPage('privacy-policy');
        if (data) {
          setCmsData({
            title: data.title || DEFAULT_PRIVACY.title,
            description: data.description || DEFAULT_PRIVACY.description,
            image: data.image || null,
          });
        }
      } catch (error) {
        console.error('Failed to load Privacy Policy from DB:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCms();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#FAF5EF] min-h-screen pb-20">
      {/* Top Header Section */}
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
              <ShieldCheck className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>PRIVACY & SECURITY</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#2B1B17] tracking-tight">
              {cmsData.title}
            </h1>
          </div>
        </Container>
      </section>

      {/* Main Dynamic Content Container */}
      <Container className="pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Dynamic Image from DB */}
          {cmsData.image && (
            <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-sm border border-[#E8DACD]">
              <Image
                src={cmsData.image}
                alt={cmsData.title || 'Privacy Policy Image'}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Dynamic Description Content from DB */}
          <div className="bg-white border border-[#E8DACD] rounded-3xl p-8 sm:p-12 shadow-xs">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-stone max-w-none text-[#705B54] leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium">
                {cmsData.description}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
