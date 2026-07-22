'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, Share2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts } from '@/data/products';
import { formatPrice } from '@/utils/formatPrice';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(featuredProducts.slice(0, 6));

  const removeItem = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

                <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#2B1B17] line-clamp-1">{prod.name}</h4>
                    <p className="font-bold text-xs sm:text-sm text-[#2B1B17] mt-0.5">{formatPrice(prod.price)}</p>
                    <span className={`inline-block text-[9px] sm:text-[10px] font-semibold mt-1 ${idx === 4 ? 'text-amber-600' : 'text-green-600'}`}>
                      ● {idx === 4 ? 'Only 4 left' : 'In Stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => removeItem(prod.id)}
                      className="p-2 sm:p-2.5 rounded-xl border border-[#E8DACD] text-gray-400 hover:text-red-500 hover:border-red-200 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 bg-[#7A0C1E] hover:bg-[#5F0917] text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Add to Cart</span>
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
      </Container>
    </div>
  );
}
