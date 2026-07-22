'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function FAQ() {
  const faqs = [
    {
      question: "Do you ship all across India?",
      answer: "Yes, we ship to over 26,000 pin codes across India. Deliveries usually take 3-5 business days for metro cities and 5-7 days for other regions."
    },
    {
      question: "Is there a free shipping option?",
      answer: "Absolutely! We offer free express shipping on all orders above ₹1,500. For orders below ₹1,500, a flat shipping fee of ₹99 is applicable."
    },
    {
      question: "Can I customize a gift hamper?",
      answer: "Yes, custom hampers are our specialty! You can use our interactive Hamper Builder tool in the navigation menu or get in touch with our concierge team via the Contact Us page for corporate/bulk customizations."
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, COD is available for most pin codes across India for a nominal cash-handling convenience fee of ₹50. Prepaid orders (UPI, Cards, NetBanking) enjoy zero additional fees."
    },
    {
      question: "What is your return and refund policy?",
      answer: "We offer a 30-day hassle-free return policy. If you receive a damaged or incorrect product, contact us within 48 hours of delivery, and we will arrange a free replacement or refund."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF5EF] border-t border-[#E8DACD]/40">
      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
            <span>COMMON INQUIRIES</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1B17]">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-0.5 bg-[#7A0C1E] mx-auto mt-4 rounded-full" />
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#E8DACD] rounded-2xl overflow-hidden shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#7A0C1E]/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <HelpCircle className={`w-5 h-5 shrink-0 transition-colors duration-300 ${
                      isOpen ? 'text-[#7A0C1E]' : 'text-gray-400'
                    }`} />
                    <span className="font-semibold text-[#2B1B17] text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#7A0C1E]' : 'rotate-0'
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 pb-5 sm:pb-6 px-5 sm:px-6' : 'grid-rows-[0fr] opacity-0 h-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
