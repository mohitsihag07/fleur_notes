'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Sparkles, Package, RotateCcw, ShoppingCart, CreditCard, User, LifeBuoy } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/utils/formatPrice';
import { faqService } from '@/services/faqService';

const FAQ_TABS = [
  { label: 'General',   icon: LifeBuoy  },
  { label: 'Shipping',  icon: Package   },
  { label: 'Returns',   icon: RotateCcw },
  { label: 'Orders',    icon: ShoppingCart },
  { label: 'Payment',   icon: CreditCard },
  { label: 'Account',   icon: User      },
];

// Static fallback FAQs (shown until DB data loads)
function buildFallbackFaqs(freeShippingThreshold, flatShippingRate, enableFreeShipping) {
  return [
    {
      id: 'f1',
      category: 'Shipping',
      question: 'Do you ship all across India?',
      answer: 'Yes, we ship to over 26,000 pin codes across India. Deliveries usually take 3–5 business days for metro cities and 5–7 days for other regions.',
    },
    {
      id: 'f2',
      category: 'Shipping',
      question: 'Is there a free shipping option?',
      answer: enableFreeShipping
        ? `Absolutely! We offer free express shipping on all orders above ${formatPrice(freeShippingThreshold)}. For orders below ${formatPrice(freeShippingThreshold)}, a flat shipping fee of ${formatPrice(flatShippingRate)} is applicable.`
        : `We offer flat rate express shipping of ${formatPrice(flatShippingRate)} on all orders.`,
    },
    {
      id: 'f3',
      category: 'General',
      question: 'Can I customize a gift hamper?',
      answer: 'Yes, custom hampers are our specialty! You can contact our concierge team via the Contact Us page for corporate/bulk customizations.',
    },
    {
      id: 'f4',
      category: 'Payment',
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'Yes, COD is available for most pin codes across India for a nominal cash-handling convenience fee of ₹50. Prepaid orders (UPI, Cards, NetBanking) enjoy zero additional fees.',
    },
    {
      id: 'f5',
      category: 'Returns',
      question: 'What is your return and refund policy?',
      answer: 'We offer a 30-day hassle-free return policy. If you receive a damaged or incorrect product, contact us within 48 hours of delivery and we will arrange a free replacement or refund.',
    },
  ];
}

export function FAQ() {
  const { freeShippingThreshold, flatShippingRate, enableFreeShipping } = useSettings();

  const [activeTab, setActiveTab] = useState('General');
  const [openIndex, setOpenIndex] = useState(null);
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFAQs() {
      try {
        const data = await faqService.getFAQs();
        if (data && data.length > 0) {
          setAllFaqs(data);
        } else {
          setAllFaqs(buildFallbackFaqs(freeShippingThreshold, flatShippingRate, enableFreeShipping));
        }
      } catch {
        setAllFaqs(buildFallbackFaqs(freeShippingThreshold, flatShippingRate, enableFreeShipping));
      } finally {
        setLoading(false);
      }
    }
    loadFAQs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive which tabs actually have FAQs (always show all tabs; filter to only those with data)
  const activeTabs = FAQ_TABS.filter(tab =>
    allFaqs.some(f => (f.category || 'General').toLowerCase() === tab.label.toLowerCase())
  );

  const displayedFaqs = allFaqs.filter(f => (f.category || 'General').toLowerCase() === activeTab.toLowerCase());

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Reset open accordion when tab changes
  const handleTabChange = (label) => {
    setActiveTab(label);
    setOpenIndex(null);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF5EF] border-t border-[#E8DACD]/40">
      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7A0C1E] uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
            <span>COMMON INQUIRIES</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B1B17]">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-0.5 bg-[#7A0C1E] mx-auto mt-4 rounded-full" />
        </div>

        {/* Category Tabs */}
        {!loading && activeTabs.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {activeTabs.map(({ label, icon: Icon }) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => handleTabChange(label)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'bg-[#7A0C1E] text-white border-[#7A0C1E] shadow-md'
                      : 'bg-white text-[#7A0C1E] border-[#E8DACD] hover:border-[#7A0C1E] hover:bg-[#FDF0EE]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#7A0C1E]'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[#E8DACD]/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayedFaqs.length === 0 ? (
          <div className="text-center py-12 text-[#705B54]">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#E8DACD]" />
            <p className="font-medium">No FAQs in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id || index}
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
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100 pb-5 sm:pb-6 px-5 sm:px-6'
                        : 'grid-rows-[0fr] opacity-0 h-0'
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
        )}
      </Container>
    </section>
  );
}
