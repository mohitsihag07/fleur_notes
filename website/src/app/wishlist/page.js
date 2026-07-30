'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, Share2, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { productService } from '@/services/productService';
import { getFormattedImage } from '@/utils/formatImage';
import { formatPrice } from '@/utils/formatPrice';
import { useShop } from '@/context/ShopContext';

export default function WishlistPage() {
  const { setWishlistCount } = useShop();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistData() {
      setLoading(true);
      try {
        const response = await productService.getProducts({ limit: 12, status: 'active' });
        const realProducts = response?.data || [];

        let formatted = [];
        if (realProducts.length > 0) {
          formatted = realProducts.map((p) => {
            let imgUrl = null;
            if (p.images && p.images.length > 0) {
              const thumb = p.images.find((i) => i.is_thumbnail) || p.images[0];
              imgUrl = thumb?.image;
            } else if (p.image) {
              imgUrl = p.image;
            }
            return {
              id: p.id || p._id,
              name: p.name,
              slug: p.slug || p.id || p._id,
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              image: getFormattedImage(imgUrl),
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: 4.8,
              stock: p.inventories?.[0]?.quantity || 10
            };
          });

          setRecommendations(formatted.slice(4, 8));
        }

        const userToken = localStorage.getItem('user_token');
        if (!userToken) {
          localStorage.removeItem('wishlist_items');
          setWishlistItems([]);
          setWishlistCount(0);
          setLoading(false);
          return;
        }

        const savedWishlist = localStorage.getItem('wishlist_items');
        if (savedWishlist !== null) {
          try {
            const parsed = JSON.parse(savedWishlist);
            setWishlistItems(parsed);
            setWishlistCount(parsed.length);
          } catch (e) {
            setWishlistItems([]);
            setWishlistCount(0);
          }
        } else {
          setWishlistItems([]);
          setWishlistCount(0);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistData();
  }, []);

  const saveWishlistState = (items) => {
    setWishlistItems(items);
    localStorage.setItem('wishlist_items', JSON.stringify(items));
    setWishlistCount(items.length);
  };

  const removeItem = (id) => {
    const updated = wishlistItems.filter((item) => item.id !== id);
    saveWishlistState(updated);
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
            <button className="flex items-center gap-2 py-2.5 px-4 bg-white border border-[#E8DACD] rounded-xl text-xs font-semibold text-[#2B1B17] hover:bg-[#F2E6DA] cursor-pointer">
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Share Wishlist</span>
            </button>
            <Link href="/cart" className="flex items-center gap-2 py-2.5 px-4 bg-[#7A0C1E] text-white rounded-xl text-xs font-semibold hover:bg-[#5F0917] transition-all">
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Cart</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E8DACD]">
            <Loader2 className="w-8 h-8 text-[#7A0C1E] animate-spin mb-2" />
            <p className="text-xs font-semibold text-[#705B54]">Loading your saved wishlist items...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DACD]">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Your wishlist is empty</h3>
            <p className="text-xs text-[#705B54] mt-1 mb-6">Explore our handcrafted items and save your favorites!</p>
            <Link href="/shop" className="py-2.5 px-6 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl inline-block">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((prod) => (
              <div key={prod.id} className="bg-white rounded-2xl border border-[#E8DACD] overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="relative aspect-[4/3] bg-[#FAF5EF]">
                  <img
                    src={getFormattedImage(prod.image)}
                    alt={prod.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <button
                    onClick={() => removeItem(prod.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#7A0C1E] hover:bg-red-50 shadow-xs cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-[#7A0C1E]" />
                  </button>
                </div>

                <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${prod.slug}`}>
                      <h4 className="font-semibold text-xs sm:text-sm text-[#2B1B17] hover:text-[#7A0C1E] line-clamp-1 transition-colors">{prod.name}</h4>
                    </Link>
                    <p className="font-bold text-xs sm:text-sm text-[#2B1B17] mt-0.5">{formatPrice(prod.price)}</p>
                    <span className="inline-block text-[9px] sm:text-[10px] font-semibold mt-1 text-green-600">
                      ● In Stock
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => removeItem(prod.id)}
                      className="p-2 sm:p-2.5 rounded-xl border border-[#E8DACD] text-gray-400 hover:text-red-500 hover:border-red-200 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href="/cart"
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 bg-[#7A0C1E] hover:bg-[#5F0917] text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Add to Cart</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* You May Also Like Section with Real DB Products */}
        {recommendations.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#E8DACD]">
            <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17] mb-6">You may also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
