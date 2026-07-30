'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Rating } from '@/components/common/Rating';
import { formatPrice } from '@/utils/formatPrice';

import { useShop } from '@/context/ShopContext';

export function ProductCard({ product, layout = 'grid' }) {
  const { toggleWishlist, isInWishlist, addToCart } = useShop();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const fallbackImg = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600';
  const [imgSrc, setImgSrc] = useState(product?.image || fallbackImg);

  React.useEffect(() => {
    if (product?.image) {
      setImgSrc(product.image);
    }
    const pId = product?.id || product?._id;
    if (pId) {
      setIsWishlisted(isInWishlist(pId));
    }
  }, [product?.image, product?.id, product?._id, isInWishlist]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    setIsWishlisted(added);
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-2xl border border-[#E8DACD]/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-row h-full w-full"
      >
        {/* Product Image Container */}
        <Link href={`/product/${product.slug}`} className="relative aspect-square w-[110px] sm:w-[150px] shrink-0 overflow-hidden bg-[#FAF5EF] block">
          <img
            src={imgSrc}
            alt={product.name || 'Product Image'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => {
              if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
            }}
          />

          {/* Wishlist Button Overlay */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 transition-all duration-200 z-10 text-[#2B1B17] hover:text-[#7A0C1E] hover:scale-110 active:scale-90 drop-shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-[#7A0C1E] text-[#7A0C1E]' : 'text-[#2B1B17]'}`} />
          </button>

          {/* Badge Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNew && (
              <span className="bg-[#7A0C1E] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider w-fit">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#A87B39] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider w-fit">
                Bestseller
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-[#5C3D8F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider w-fit">
                Featured
              </span>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1 justify-between bg-white min-w-0">
          <div>
            <Link href={`/product/${product.slug}`} className="block group-hover:text-[#7A0C1E] transition-colors">
              <h3 className="font-semibold text-sm sm:text-base text-[#2B1B17] line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Star Rating */}
            <div className="mt-1">
              <Rating rating={product.rating} count={product.reviewsCount} size="sm" />
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 hidden sm:block">
              {product.description || 'Artisanal product handcrafted with pure materials and exceptional quality for your boutique collection.'}
            </p>
          </div>

          {/* Price & Add to Cart Action */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F2E6DA]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#2B1B17]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className={`p-2 rounded-lg border transition-all duration-300 ${
                isAdded
                  ? 'bg-[#3A7D44] border-[#3A7D44] text-white'
                  : 'border-[#E8DACD] text-[#2B1B17] hover:bg-[#7A0C1E] hover:border-[#7A0C1E] hover:text-white'
              }`}
              aria-label="Add to cart"
            >
              {isAdded ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-[#E8DACD]/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-[#FAF5EF] block">
        <img
          src={imgSrc}
          alt={product.name || 'Product Image'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => {
            if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
          }}
        />

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 transition-all duration-200 z-10 text-[#2B1B17] hover:text-[#7A0C1E] hover:scale-110 active:scale-90 drop-shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4.5 h-4.5 transition-colors ${isWishlisted ? 'fill-[#7A0C1E] text-[#7A0C1E]' : 'text-[#2B1B17]'}`} />
        </button>

        {/* Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-[#7A0C1E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#A87B39] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
              Bestseller
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#5C3D8F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
              Featured
            </span>
          )}
        </div>
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
