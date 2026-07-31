'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { productService } from '@/services/productService';
import { getFormattedImage } from '@/utils/formatImage';

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const realProducts = await productService.featuredProducts();
        if (Array.isArray(realProducts) && realProducts.length > 0) {
          // Filter strictly for products flagged as is_featured: true
          const featuredOnly = realProducts.filter(p => p.is_featured === true || p.is_featured === 'true' || p.is_featured === 1);
          
          const formatted = featuredOnly.map((p, idx) => {
            let rawImg = null;
            if (p.images && p.images.length > 0) {
              const thumb = p.images.find((img) => img.is_thumbnail) || p.images[0];
              rawImg = thumb?.image;
            } else if (p.image) {
              rawImg = p.image;
            }

            return {
              id: p.id || p._id || `prod-${idx}`,
              name: p.name,
              slug: p.slug || p.id || p._id,
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              image: getFormattedImage(rawImg),
              isFeatured: true,
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: p.rating || 4.9,
              reviewsCount: p.reviews_count || 48,
              description: p.description
            };
          });
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#F2E6DA]/50 border-y border-[#E8DACD]/60">
      <Container>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
              Featured Products
            </h2>
            <p className="text-sm text-[#705B54] mt-1">
              Handpicked customer favorites for your home
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A0C1E] hover:text-[#5F0917] group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 2-Column mobile, 4-Column desktop Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#7A0C1E]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm font-bold">Loading Featured Products...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, idx) => (
              <ProductCard key={product.id || product._id || `prod-${idx}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white/60 border border-[#E8DACD] rounded-2xl p-8 text-center space-y-3">
            <p className="text-xs text-[#705B54] font-medium">No featured products marked yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 py-2 px-5 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl hover:bg-[#5F0917] transition-colors"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
