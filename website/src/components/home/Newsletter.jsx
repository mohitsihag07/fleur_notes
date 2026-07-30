'use client';

import React, { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useSettings } from '@/context/SettingsContext';
import { apiRequest } from '@/services/api';

export function Newsletter() {
  const { newsletterTitle, newsletterSubtitle } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await apiRequest('/settings/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      // Even on error, show optimistic success feedback to customer
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#FAF5EF]">
      <Container>
        <div className="bg-[#F2E6DA] border border-[#E8DACD] rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Info */}
            <div className="flex items-start gap-4 text-center md:text-left">
              <div className="p-3.5 rounded-full bg-[#7A0C1E]/10 text-[#7A0C1E] shrink-0 hidden sm:flex border border-[#A87B39]/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
                  {newsletterTitle || 'Get 10% Off Your First Order!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#705B54] mt-1">
                  {newsletterSubtitle || 'Join our newsletter for exclusive offers, new arrivals, and more.'}
                </p>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1 max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-[#E8DACD] bg-white outline-none focus:border-[#7A0C1E] transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-sm font-medium rounded-xl transition-all duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : subscribed ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
