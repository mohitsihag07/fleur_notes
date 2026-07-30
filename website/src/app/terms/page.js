'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { cmsService } from '@/services/cmsService';

const DEFAULT_TERMS = {
  title: 'Terms & Conditions',
  description: `Welcome to Caflore. By accessing or purchasing from our store, you agree to be bound by these Terms and Conditions.

1. General Conditions:
We reserve the right to refuse service to anyone for any reason at any time. Prices for our products are subject to change without notice.

2. Products & Services:
We make every effort to display as accurately as possible the colors and images of our products that appear at the store.

3. Accuracy of Billing & Account Information:
You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.

4. Governing Law:
These Terms of Service and any separate agreements shall be governed by and construed in accordance with applicable laws.`,
  image: null,
};

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);
  const [cmsData, setCmsData] = useState(DEFAULT_TERMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCms() {
      try {
        const data = await cmsService.getCmsPage('terms-and-conditions') || await cmsService.getCmsPage('terms');
        if (data) {
          setCmsData({
            title: data.title || DEFAULT_TERMS.title,
            description: data.description || DEFAULT_TERMS.description,
            image: data.image || null,
          });
        }
      } catch (error) {
        console.error('Failed to load Terms from DB:', error);
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
              <BookOpen className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>TERMS OF SERVICE</span>
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
                alt={cmsData.title || 'Terms & Conditions Image'}
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
