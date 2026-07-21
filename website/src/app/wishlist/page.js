'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, Share2, Plus, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts } from '@/data/products';

export default function WishlistPage() {
  const [activeCollection, setActiveCollection] = useState('all');
  const [wishlistItems, setWishlistItems] = useState(featuredProducts.slice(0, 6));

  const removeItem = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const collections = [
    { id: 'all', name: 'All Items', count: wishlistItems.length },
    { id: 'home-decor', name: 'Home Decor', count: 3 },
    { id: 'gifts', name: 'Gifts', count: 2 },
    { id: 'accessories', name: 'Accessories', count: 1 }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#E8DACD]">
          <div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
              My Wishlist
            </h1>
            <p className="text-xs text-[#705B54] mt-1">
              {wishlistItems.length} items saved for later
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 py-2.5 px-4 bg-white border border-[#E8DACD] rounded-xl text-xs font-semibold text-[#2B1B17] hover:bg-[#F2E6DA]">
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Share Wishlist</span>
            </button>
            <button className="flex items-center gap-2 py-2.5 px-4 bg-[#7A0C1E] text-white rounded-xl text-xs font-semibold hover:bg-[#5F0917]">
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Cart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Wishlist Collections Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DACD]">
                <h3 className="font-semibold text-xs uppercase text-[#2B1B17] tracking-wider">
                  Wishlist Collections
                </h3>
                <button className="text-gray-400 hover:text-[#7A0C1E]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <ul className="space-y-1 text-xs">
                {collections.map((col) => (
                  <li key={col.id}>
                    <button
                      onClick={() => setActiveCollection(col.id)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-left transition-colors ${
                        activeCollection === col.id
                          ? 'bg-[#F2E6DA] text-[#7A0C1E] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 fill-[#7A0C1E] text-[#7A0C1E]" />
                        <span>{col.name}</span>
                      </div>
                      <span className="text-gray-400 font-normal">{col.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Promo Box */}
            <div className="bg-[#F2E6DA] rounded-2xl border border-[#E8DACD] p-5 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mx-auto text-[#7A0C1E]">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-xs text-[#2B1B17]">Don't see something you love anymore?</h4>
              <p className="text-[11px] text-[#705B54]">Items in your wishlist won't last forever.</p>
              <Link href="/shop" className="block w-full py-2 px-4 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl hover:bg-[#5F0917]">
                Shop Now
              </Link>
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="lg:col-span-9">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DACD]">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Your wishlist is empty</h3>
                <p className="text-xs text-[#705B54] mt-1 mb-6">Explore our handcrafted items and save your favorites!</p>
                <Link href="/shop" className="py-2.5 px-6 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((prod, idx) => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-[#E8DACD] overflow-hidden shadow-sm flex flex-col justify-between group">
                    <div className="relative aspect-[4/3] bg-[#FAF5EF]">
                      <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                      <button
                        onClick={() => removeItem(prod.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#7A0C1E] hover:bg-red-50 shadow-xs"
                      >
                        <Heart className="w-4 h-4 fill-[#7A0C1E]" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-[#2B1B17]">{prod.name}</h4>
                        <p className="font-bold text-sm text-[#2B1B17] mt-0.5">${prod.price.toFixed(2)}</p>
                        <span className={`inline-block text-[10px] font-semibold mt-1 ${idx === 4 ? 'text-amber-600' : 'text-green-600'}`}>
                          ● {idx === 4 ? 'Only 4 left' : 'In Stock'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => removeItem(prod.id)}
                          className="p-2.5 rounded-xl border border-[#E8DACD] text-gray-400 hover:text-red-500 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#7A0C1E] hover:bg-[#5F0917] text-white rounded-xl text-xs font-bold">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* You May Also Like Section */}
            <div className="mt-16 pt-8 border-t border-[#E8DACD]">
              <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17] mb-6">You may also like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {featuredProducts.slice(4, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
