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

export default function ContactPage() {
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
            image: imgUrl
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
      line1: '123 Greenway Lane, Suite 101',
      line2: 'Los Angeles, CA 90024, USA'
    },
    {
      icon: Mail,
      title: 'Email Us',
      line1: 'hello@fleurnotes.com',
      line2: null
    },
    {
      icon: Phone,
      title: 'Call Us',
      line1: '+1 (555) 123-4567',
      line2: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      line1: 'Mon – Fri: 9:00 AM – 6:00 PM (EST)',
      line2: 'Sat – Sun: 10:00 AM – 4:00 PM (EST)'
    }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner (Full Screen Width) */}
      <section className="relative overflow-hidden w-full h-[70vh] sm:h-[80vh] min-h-[580px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>

        {/* Hero Content (Layered directly over the banner) */}
        <Container className="relative z-10 w-full">
          <div className="max-w-xl md:max-w-2xl flex flex-col items-start space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>{banner.tagline}</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#7A0C1E] leading-tight tracking-tight">
              {banner.title}
            </h1>
            <p className="text-base sm:text-lg text-black font-medium leading-relaxed max-w-lg">
              {banner.description}
            </p>
            <div className="pt-2">
              <a href="#contact-form">
                <Button variant="primary" icon={Send} iconPosition="left" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917]">
                  Send Us a Message
                </Button>
              </a>
            </div>
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
