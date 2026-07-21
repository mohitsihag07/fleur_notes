'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Box
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts } from '@/data/products';

export default function ProductDetailPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Beige');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const galleryImages = [
    '/images/products/vase.jpg',
    '/images/categories/home_decor.jpg',
    '/images/categories/gifts.jpg',
    '/images/banners/hero_banner.jpg',
    '/images/categories/candles.jpg'
  ];

  const colors = [
    { name: 'Beige', class: 'bg-[#F2E6DA]' },
    { name: 'Bronze', class: 'bg-[#A87B39]' },
    { name: 'Crimson', class: 'bg-[#7A0C1E]' }
  ];

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
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-[#7A0C1E] shadow-sm scale-105' : 'border-[#E8DACD] opacity-70'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Enlarged Product Image */}
            <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#E8DACD] shadow-xs">
              <Image
                src={galleryImages[selectedImageIndex]}
                alt="Minimal Ceramic Vase"
                fill
                className="object-cover"
                priority
              />
              <button className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 shadow-md text-[#2B1B17] hover:text-[#7A0C1E]">
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
              $28.00
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
                Free Shipping over $75
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#7A0C1E]" />
                30-Day Returns
              </span>
            </div>

            {/* Color Selection */}
            <div>
              <span className="block text-xs font-semibold text-[#2B1B17] mb-2">Color: {selectedColor}</span>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-7 h-7 rounded-full border ${c.class} transition-transform ${
                      selectedColor === c.name ? 'scale-115 ring-2 ring-[#7A0C1E] ring-offset-1' : ''
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
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

            {/* Wishlist & Share */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <button className="flex items-center gap-1.5 hover:text-[#7A0C1E]">
                <Heart className="w-4 h-4" />
                <span>Add to Wishlist</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#7A0C1E]">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
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
          <div className="flex border-b border-[#E8DACD] gap-8 text-xs font-bold text-gray-400 overflow-x-auto pb-3 mb-6">
            {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`uppercase tracking-wider transition-colors pb-3 border-b-2 -mb-[14px] ${
                  activeTab === tab ? 'border-[#7A0C1E] text-[#7A0C1E]' : 'border-transparent hover:text-[#2B1B17]'
                }`}
              >
                {tab === 'shipping' ? 'Shipping & Returns' : tab === 'reviews' ? 'Reviews (126)' : tab}
              </button>
            ))}
          </div>

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
            <div className="space-y-4 max-w-2xl text-xs text-gray-600">
              <div className="flex items-center gap-2 text-[#A87B39] font-bold">
                <Star className="w-4 h-4 fill-[#A87B39]" />
                <span className="text-base text-[#2B1B17]">4.8 out of 5</span>
              </div>
              <p>Based on 126 verified customer reviews across all handcrafted batches.</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-2 max-w-2xl text-xs text-gray-600">
              <p className="font-semibold text-[#2B1B17]">Free standard shipping on orders over $75.</p>
              <p>Orders are dispatched within 1-2 business days with 30-day return policy guarantee.</p>
            </div>
          )}
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
