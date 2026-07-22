'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { featuredProducts as staticFeaturedProducts } from '@/data/products';
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
          // Normalize real backend products format for ProductCard component
          const formatted = realProducts.map((p) => {
            let rawImg = null;
            if (p.images && p.images.length > 0) {
              const thumb = p.images.find((img) => img.is_thumbnail) || p.images[0];
              rawImg = thumb?.image;
            } else if (p.image) {
              rawImg = p.image;
            }

            const imgUrl = getFormattedImage(rawImg);

            return {
              id: p.id,
              name: p.name,
              slug: p.slug || p.id,
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              image: imgUrl,
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: p.rating || 4.9,
              reviewsCount: p.reviews_count || 48,
              description: p.description
            };
          });
          setProducts(formatted);
        } else {
          // Fallback to curated static list if no featured items marked yet
          setProducts(staticFeaturedProducts);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setProducts(staticFeaturedProducts);
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
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
