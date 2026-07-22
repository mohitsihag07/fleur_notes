'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Maximize2,
  CheckCircle2,
  Gift,
  Leaf,
  Box,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts } from '@/data/products';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductDetailPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const selectImage = (idx) => {
    setSlideDirection(idx > selectedImageIndex ? 1 : -1);
    setSelectedImageIndex(idx);
  };

  const galleryImages = [
    '/images/products/vase.jpg',
    '/images/categories/home_decor.jpg',
    '/images/categories/gifts.jpg',
    '/images/banners/hero_banner.jpg',
    '/images/categories/candles.jpg'
  ].slice(0, 4);

  const valueBadges = [
    { icon: Sparkles, title: 'Handmade', desc: 'Carefully crafted by artisans' },
    { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly materials' },
    { icon: Box, title: 'Secure Packaging', desc: 'Safe delivery guaranteed' },
    { icon: Gift, title: 'Perfect Gift', desc: 'Great for any occasion' }
  ];

  const specifications = [
    { label: 'Material', value: 'Ceramic' },
    { label: 'Color', value: 'Beige' },
    { label: 'Dimensions', value: '15 cm (H) x 10 cm (W)' },
    { label: 'Weight', value: '0.45 kg' },
    { label: 'Care Instructions', value: 'Wipe with a soft, dry cloth' }
  ];

  const mockReviews = [
    {
      id: 'rev-1',
      name: 'Aditi Sharma',
      date: 'July 15, 2026',
      rating: 5,
      comment: 'Absolutely gorgeous bouquet! The dried eucalyptus leaves smell divine and the packaging was extremely secure. Highly recommended.'
    },
    {
      id: 'rev-2',
      name: 'Rohan Mehta',
      date: 'June 28, 2026',
      rating: 4,
      comment: 'Very premium look and feel. It looks stunning on my dining table. Knocked off one star because shipping took a day longer than expected.'
    },
    {
      id: 'rev-3',
      name: 'Priyanka Sen',
      date: 'June 10, 2026',
      rating: 5,
      comment: 'The quality of Fleur Notes products is unmatched. Exceeded all my expectations. Will definitely buy more items soon!'
    }
  ];

  const nextImage = () => {
    setSlideDirection(1);
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSlideDirection(-1);
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      nextImage();
    }
    if (touchStartX - touchEndX < -50) {
      prevImage();
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 60 : -60,
      opacity: 0
    })
  };

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        {/* Breadcrumb Nav */}
        <nav className="text-xs text-gray-500 flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-[#7A0C1E]">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-[#7A0C1E]">Decor</Link>
          <span>›</span>
          <Link href="/shop?category=vases" className="hover:text-[#7A0C1E]">Vases</Link>
          <span>›</span>
          <span className="text-[#7A0C1E] font-medium">Minimal Ceramic Vase</span>
        </nav>

        {/* Top Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Photo Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails stack */}
            <div className="flex sm:flex-col gap-3 shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => selectImage(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-[#7A0C1E] shadow-sm scale-105' : 'border-[#E8DACD] opacity-70'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Enlarged Product Image */}
            <div
              className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#E8DACD] shadow-xs group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} custom={slideDirection}>
                <motion.div
                  key={selectedImageIndex}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt="Minimal Ceramic Vase"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Overlay Actions: Wishlist and Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-3.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsInWishlist(!isInWishlist)}
                  className="text-[#2B1B17] hover:text-[#7A0C1E] hover:scale-110 active:scale-90 transition-all cursor-pointer drop-shadow-sm"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 transition-colors ${
                    isInWishlist ? 'fill-[#7A0C1E] text-[#7A0C1E]' : 'text-[#2B1B17]'
                  }`} />
                </button>

                <button
                  type="button"
                  className="text-[#2B1B17] hover:text-[#7A0C1E] hover:scale-110 active:scale-90 transition-all cursor-pointer drop-shadow-sm"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Navigation Arrows */}
              <button
                type="button"
                onClick={prevImage}
                className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2B1B17] hover:text-[#7A0C1E] shadow-md transition-all duration-300 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2B1B17] hover:text-[#7A0C1E] shadow-md transition-all duration-300 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-xs">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectImage(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      selectedImageIndex === idx ? 'bg-white w-3.5' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 shadow-md text-[#2B1B17] hover:text-[#7A0C1E] max-sm:hidden cursor-pointer">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Product Details Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17] tracking-tight">
                Minimal Ceramic Vase
              </h1>

              {/* Rating & Sold Bar */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-[#A87B39]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#A87B39]" />
                  ))}
                  <span className="font-bold text-[#2B1B17] ml-1">4.8</span>
                  <span className="text-gray-400">(126 reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-[#705B54] font-medium">238 sold</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-[#2B1B17]">
              {formatPrice(28)}
            </div>

            <p className="text-xs text-[#705B54] leading-relaxed">
              A timeless ceramic vase with a minimalist design, perfect for fresh flowers, dried stems, or as a standalone decor piece.
            </p>

            {/* In Stock & Shipping Badges Bar */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-[#E8DACD] text-[11px] text-[#705B54]">
              <span className="flex items-center gap-1 font-bold text-green-700">
                ● In Stock
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#7A0C1E]" />
                Free Shipping over {formatPrice(1500)}
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#7A0C1E]" />
                30-Day Returns
              </span>
            </div>

            {/* Quantity Selector */}
            <div>
              <span className="block text-xs font-semibold text-[#2B1B17] mb-2">Quantity</span>
              <div className="inline-flex items-center border border-[#E8DACD] rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-gray-500 hover:text-[#2B1B17]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-[#2B1B17]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-gray-500 hover:text-[#2B1B17]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="space-y-3 pt-2">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button className="w-full py-3 bg-white border border-[#E8DACD] text-[#2B1B17] hover:bg-[#F2E6DA] rounded-xl text-xs font-bold transition-colors cursor-pointer">
                Buy Now
              </button>
            </div>



            {/* Value Badges Side Column Box */}
            <div className="bg-[#F2E6DA]/70 rounded-2xl border border-[#E8DACD] p-4 space-y-3">
              {valueBadges.map((vb, idx) => {
                const Icon = vb.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2B1B17]">{vb.title}</h4>
                      <p className="text-[10px] text-[#705B54]">{vb.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="mt-16 bg-white rounded-2xl border border-[#E8DACD] p-6 sm:p-10 shadow-sm">
          <div className="flex border-b border-[#E8DACD] gap-8 text-xs font-bold text-gray-400 overflow-x-auto no-scrollbar pb-3 mb-6 relative">
            {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`uppercase tracking-wider transition-colors pb-3 relative ${
                  activeTab === tab ? 'text-[#7A0C1E]' : 'hover:text-[#2B1B17]'
                }`}
              >
                <span>{tab === 'shipping' ? 'Shipping & Returns' : tab === 'reviews' ? 'Reviews (126)' : tab}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="productActiveTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A0C1E]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'description' && (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed max-w-3xl">
              <p>
                This minimal ceramic vase brings a touch of elegance to any space. Its neutral tones and smooth matte finish make it easy to pair with any decor style — from modern to rustic.
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-gray-600">
                <li>Perfect for fresh flowers, dried arrangements, or greenery</li>
                <li>Matte finish with a smooth texture</li>
                <li>Water-resistant and durable stoneware</li>
                <li>Ideal for home, office, or gifting</li>
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-md">
              <table className="w-full text-xs text-left">
                <tbody>
                  {specifications.map((s, idx) => (
                    <tr key={idx} className="border-b border-[#E8DACD]/60">
                      <td className="py-2.5 font-semibold text-[#2B1B17] w-1/3">{s.label}</td>
                      <td className="py-2.5 text-gray-600">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Summary Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#E8DACD]/60 pb-8">
                {/* Average score */}
                <div className="md:col-span-4 flex flex-col items-center justify-center bg-[#FAF5EF]/60 p-6 rounded-xl border border-[#E8DACD]/40 text-center">
                  <span className="text-4xl font-bold text-[#2B1B17]">4.8</span>
                  <div className="flex items-center gap-1 text-[#A87B39] my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-[#A87B39]' : 'fill-[#A87B39]/30'} text-[#A87B39]`} />
                    ))}
                  </div>
                  <span className="text-xs text-[#705B54]">Based on 126 ratings</span>
                </div>

                {/* Rating distribution bars */}
                <div className="md:col-span-8 space-y-2.5 flex flex-col justify-center">
                  {[
                    { stars: 5, percentage: 85 },
                    { stars: 4, percentage: 10 },
                    { stars: 3, percentage: 3 },
                    { stars: 2, percentage: 1 },
                    { stars: 1, percentage: 1 }
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-4 text-[#2B1B17] font-semibold">{row.stars}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#A87B39] rounded-full" style={{ width: `${row.percentage}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-gray-500 font-medium">{row.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                <h4 className="font-serif-luxury text-lg font-bold text-[#2B1B17] mb-4">Customer Reviews</h4>
                <div className="divide-y divide-[#E8DACD]/40 space-y-6">
                  {mockReviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          {/* User Avatar Circle */}
                          <div className="w-9 h-9 rounded-full bg-[#7A0C1E] text-white flex items-center justify-center font-bold text-xs">
                            {rev.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#2B1B17]">{rev.name}</span>
                            <span className="block text-[10px] text-gray-400">{rev.date}</span>
                          </div>
                        </div>

                        {/* User Rating stars */}
                        <div className="flex gap-0.5 text-[#A87B39]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#A87B39]' : 'fill-none'} text-[#A87B39]`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed sm:pl-12">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

              {activeTab === 'shipping' && (
                <div className="space-y-2 max-w-2xl text-xs text-gray-600">
                  <p className="font-semibold text-[#2B1B17]">Free standard shipping on orders over {formatPrice(1500)}.</p>
                  <p>Orders are dispatched within 1-2 business days with 30-day return policy guarantee.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-16">
          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17] mb-6">You may also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
