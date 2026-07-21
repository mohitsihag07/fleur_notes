'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Rating } from '@/components/common/Rating';
import { formatPrice } from '@/utils/formatPrice';

export function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-[#E8DACD]/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-[#FAF5EF] block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
        />

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? 'bg-[#7A0C1E] text-white shadow-md'
              : 'bg-white/80 text-[#2B1B17] hover:bg-white hover:text-[#7A0C1E]'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Badge Overlay */}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#7A0C1E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            New
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <Link href={`/product/${product.slug}`} className="block group-hover:text-[#7A0C1E] transition-colors">
            <h3 className="font-semibold text-sm sm:text-base text-[#2B1B17] line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="mt-1.5">
            <Rating rating={product.rating} count={product.reviewsCount} size="sm" />
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#F2E6DA]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-[#2B1B17]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              isAdded
                ? 'bg-[#3A7D44] border-[#3A7D44] text-white'
                : 'border-[#E8DACD] text-[#2B1B17] hover:bg-[#7A0C1E] hover:border-[#7A0C1E] hover:text-white'
            }`}
            aria-label="Add to cart"
          >
            {isAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
