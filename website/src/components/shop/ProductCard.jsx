'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { Rating } from '@/components/common/Rating';
import { formatPrice } from '@/utils/formatPrice';

import { useShop } from '@/context/ShopContext';

export function ProductCard({ product, layout = 'grid' }) {
  const { toggleWishlist, isInWishlist, addToCart, removeFromCart, updateCartQuantity, getCartItemQuantity, cartCount } = useShop();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQty, setCartQty] = useState(0);

  const [imgSrc, setImgSrc] = useState(product?.image || extractProductImage(product));

  const pId = product?.id || product?._id;

  React.useEffect(() => {
    if (product?.image) {
      setImgSrc(product.image);
    }
    if (pId) {
      setIsWishlisted(isInWishlist(pId));
      if (getCartItemQuantity) {
        setCartQty(getCartItemQuantity(pId));
      }
    }
  }, [product?.image, pId, isInWishlist, cartCount, getCartItemQuantity]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQty = (cartQty || 0) + 1;
    setCartQty(newQty);
    await addToCart(product, 1);
  };

  const handleIncrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQty = cartQty + 1;
    setCartQty(newQty);
    await addToCart(product, 1);
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQty = cartQty - 1;
    setCartQty(Math.max(0, newQty));
    if (newQty <= 0) {
      await removeFromCart(pId);
    } else {
      await updateCartQuantity(pId, newQty);
    }
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
            {product.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 hidden sm:block">
                {product.description}
              </p>
            )}
          </div>

          {/* Price & Add to Cart Action */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F2E6DA]">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 min-w-0 pr-1">
              <span className="font-bold text-xs sm:text-sm text-[#2B1B17] whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 line-through whitespace-nowrap">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {cartQty > 0 ? (
              <div className="shrink-0 flex items-center bg-[#7A0C1E] text-white rounded-lg overflow-hidden border border-[#7A0C1E]">
                <button
                  onClick={handleDecrement}
                  className="px-1.5 py-1 hover:bg-[#5F0917] transition-colors text-[10px] font-bold flex items-center justify-center cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 text-[10px] font-bold min-w-[14px] text-center select-none">
                  {cartQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-1.5 py-1 hover:bg-[#5F0917] transition-colors text-[10px] font-bold flex items-center justify-center cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAddToCart}
                className="shrink-0 p-1.5 rounded-lg border border-[#E8DACD] text-[#2B1B17] hover:bg-[#7A0C1E] hover:border-[#7A0C1E] hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </motion.button>
            )}
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
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 min-w-0 pr-1">
            <span className="font-bold text-xs sm:text-sm text-[#2B1B17] whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through whitespace-nowrap">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {cartQty > 0 ? (
            <div className="shrink-0 flex items-center bg-[#7A0C1E] text-white rounded-lg overflow-hidden border border-[#7A0C1E]">
              <button
                onClick={handleDecrement}
                className="px-1.5 py-1 hover:bg-[#5F0917] transition-colors text-[10px] font-bold flex items-center justify-center cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1 text-[10px] font-bold min-w-[14px] text-center select-none">
                {cartQty}
              </span>
              <button
                onClick={handleIncrement}
                className="px-1.5 py-1 hover:bg-[#5F0917] transition-colors text-[10px] font-bold flex items-center justify-center cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className="shrink-0 p-2 rounded-xl border border-[#E8DACD] text-[#2B1B17] hover:bg-[#7A0C1E] hover:border-[#7A0C1E] hover:text-white transition-all duration-300 cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
