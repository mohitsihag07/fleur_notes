'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Send, ChevronRight, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';
import { ValueProps } from '@/components/home/ValueProps';
import { bannerService } from '@/services/bannerService';
import { getBackendURL } from '@/services/api';

import { useSettings } from '@/context/SettingsContext';

export default function ContactPage() {
  const { contactEmail, contactPhone, storeAddress, businessHours } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [banner, setBanner] = useState({
    title: "Let's Create Something Beautiful Together",
    description: "Have a question, need help, or just want to say hello? We're here for you.",
    tagline: "WE'D LOVE TO HEAR FROM YOU",
    image: '/images/banners/hero_banner.jpg'
  });

  useEffect(() => {
    async function loadBanner() {
      try {
        const fetchedBanners = await bannerService.getBanners({ limit: 1, type: 'contact' });
        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
          let imgUrl = b.image || '/images/banners/hero_banner.jpg';
          if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
            const path = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            imgUrl = `${backendUrl}${path}`;
          }
          setBanner({
            title: b.title || "Let's Create Something Beautiful Together",
            description: b.description || "Have a question, need help, or just want to say hello? We're here for you.",
            tagline: b.tagline || "WE'D LOVE TO HEAR FROM YOU",
            image: imgUrl,
            primary_cta_text: b.primary_cta_text || b.button_text,
            primary_cta_link: b.primary_cta_link || b.button_link,
            secondary_cta_text: b.secondary_cta_text,
            secondary_cta_link: b.secondary_cta_link,
          });
        }
      } catch (error) {
        console.error('Failed to load contact banner:', error);
      }
    }
    loadBanner();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactItems = [
    {
      icon: MapPin,
      title: 'Our Address',
      line1: storeAddress || '123 Blossom Avenue, Suite 400, New York, NY 10001',
      line2: null
    },
    {
      icon: Mail,
      title: 'Email Us',
      line1: contactEmail || 'hello@caflore.com',
      line2: null
    },
    {
      icon: Phone,
      title: 'Call Us',
      line1: contactPhone || '+1 (800) 555-0199',
      line2: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      line1: businessHours ? (businessHours.includes('\n') ? businessHours.split('\n')[0] : businessHours) : 'Mon – Fri: 9:00 AM – 6:00 PM (EST)',
      line2: businessHours && businessHours.includes('\n') ? businessHours.split('\n')[1] : null
    }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner (Full Screen Width) */}
      <section className="relative overflow-hidden w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title || 'Contact Banner'}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          {/* Subtle dark gradient overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>

        {/* Hero Content (Layered directly over the banner) */}
        <Container className="relative z-10 w-full py-10 sm:py-16">
          <div className="max-w-xl md:max-w-2xl flex flex-col items-start space-y-3 sm:space-y-4 text-white">
            {banner.tagline && (
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#FAF5EF] uppercase bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 fill-[#FAF5EF]" />
                <span>{banner.tagline}</span>
              </div>
            )}
            {banner.title && (
              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                {banner.title}
              </h1>
            )}
            {banner.description && (
              <p className="text-xs sm:text-base lg:text-lg text-gray-100 font-medium leading-normal sm:leading-relaxed max-w-lg drop-shadow">
                {banner.description}
              </p>
            )}

            {/* Dynamic CTAs */}
            {(banner.primary_cta_text || banner.secondary_cta_text) && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {banner.primary_cta_text && (
                  <a href={banner.primary_cta_link || '#contact-form'}>
                    <Button variant="primary" icon={Send} iconPosition="left" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white">
                      {banner.primary_cta_text}
                    </Button>
                  </a>
                )}

                {banner.secondary_cta_text && (
                  <a href={banner.secondary_cta_link || '#'}>
                    <Button variant="outline" className="rounded-xl px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-xs">
                      {banner.secondary_cta_text}
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Form & Contact Info Section */}
      <section id="contact-form" className="py-16 bg-[#FAF5EF]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Card: Send Us a Message */}
            <div className="lg:col-span-7 bg-[#F2E6DA]/60 border border-[#E8DACD] rounded-2xl p-6 sm:p-10 shadow-sm">
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-[#705B54] mt-1 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8DACD] bg-white outline-none focus:border-[#7A0C1E] transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8DACD] bg-white outline-none focus:border-[#7A0C1E] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8DACD] bg-white outline-none focus:border-[#7A0C1E] transition-colors"
                  />
                </div>

                <div>
                  <textarea
                    rows={5}
                    required
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8DACD] bg-white outline-none focus:border-[#7A0C1E] transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={Send}
                  iconPosition="left"
                  className="rounded-xl px-8 py-3 font-medium text-sm bg-[#7A0C1E] hover:bg-[#5F0917]"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Right Card: Contact Information */}
            <div className="lg:col-span-5 bg-[#F2E6DA]/60 border border-[#E8DACD] rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
                  Contact Information
                </h2>
                <p className="text-xs sm:text-sm text-[#705B54] mt-1 mb-8">
                  We're always here to help. Reach out to us through any of the channels below.
                </p>

                <div className="space-y-6">
                  {contactItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-white/70 border border-[#E8DACD]/50 hover:bg-white transition-colors">
                        <div className="p-3 rounded-full bg-[#F2E6DA] text-[#7A0C1E] shrink-0 border border-[#E8DACD]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-[#2B1B17]">{item.title}</h4>
                          <p className="text-xs text-[#705B54] mt-0.5">{item.line1}</p>
                          {item.line2 && <p className="text-xs text-[#705B54]">{item.line2}</p>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 self-center hidden sm:block" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom Features Bar */}
      <ValueProps />
    </div>
  );
}
