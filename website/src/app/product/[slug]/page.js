'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Maximize2,
  Gift,
  Leaf,
  Box,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { productService } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';
import { useSettings } from '@/context/SettingsContext';
import { useShop } from '@/context/ShopContext';
import { getFormattedImage } from '@/utils/formatImage';

function renderFormattedDescription(text) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return (
    <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        const isBullet = /^[•\-*]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed);

        if (isBullet) {
          const cleanText = trimmed.replace(/^[•\-*]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A0C1E] mt-1.5 shrink-0" />
              <span className="flex-1 font-medium">{cleanText}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function ProductDetailPage() {
  const { freeShippingThreshold, flatShippingRate, enableFreeShipping } = useSettings();
  const { toggleWishlist, isInWishlist, addToCart } = useShop();
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const list = await productService.featuredProducts();
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((p) => {
            let imgUrl = null;
            if (p.images && p.images.length > 0) {
              const thumb = p.images.find((img) => img.is_thumbnail) || p.images[0];
              imgUrl = thumb?.image;
            } else if (p.image) {
              imgUrl = p.image;
            }

            return {
              id: p._id || p.id,
              _id: p._id || p.id,
              name: p.name,
              slug: p.slug || p._id || p.id,
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              image: getFormattedImage(imgUrl),
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: 4.8,
              reviewsCount: 32
            };
          });
          setRelatedProducts(formatted);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };
    fetchRelated();
  }, []);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specifications');

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(slug);
        let prodData = null;
        if (res?.data) {
          prodData = res.data;
        } else if (res && typeof res === 'object' && (res._id || res.id || res.name)) {
          prodData = res;
        }
        setProduct(prodData);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug]);

  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.map((imgObj) => getFormattedImage(imgObj.image));
    }
    if (product.image) {
      return [getFormattedImage(product.image)];
    }
    return [];
  }, [product]);

  const selectImage = (idx) => {
    setSelectedImageIndex(idx);
  };

  const valueBadges = [
    { icon: Sparkles, title: 'Handmade', desc: 'Carefully crafted by artisans' },
    { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly materials' },
    { icon: Box, title: 'Secure Packaging', desc: 'Safe delivery guaranteed' },
    { icon: Gift, title: 'Perfect Gift', desc: 'Great for any occasion' }
  ];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
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

  if (loading) {
    return (
      <div className="bg-[#FAF5EF] min-h-screen py-24 flex flex-col items-center justify-center text-[#7A0C1E]">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span className="text-sm font-bold">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAF5EF] min-h-screen py-24 text-center">
        <Container>
          <h2 className="text-2xl font-bold text-[#2B1B17] mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The requested product does not exist or has been removed.</p>
          <Link href="/shop" className="px-6 py-2.5 bg-[#7A0C1E] text-white font-bold rounded-xl text-xs">
            Back to Shop
          </Link>
        </Container>
      </div>
    );
  }

  const effectivePrice = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price || 0);
  const originalPrice = product.sale_price ? parseFloat(product.price) : null;
  const stockQuantity = product.inventory?.quantity ?? 10;

  const reviewsList = Array.isArray(product?.reviews) ? product.reviews : [];

  const totalReviewsCount = reviewsList.length;
  const avgRatingScore = totalReviewsCount > 0
    ? (reviewsList.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => Math.round(parseFloat(r.rating) || 5) === stars).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percentage };
  });

  const specsList = [
    ...(product?.material ? [{ label: 'Material', value: product.material }] : []),
    ...(product?.color ? [{ label: 'Color', value: product.color }] : []),
    ...(product?.weight ? [{ label: 'Weight', value: `${product.weight} kg` }] : []),
    ...((product?.length || product?.width || product?.height) ? [{ label: 'Dimensions', value: `${product.length || ''} cm (L) × ${product.width || ''} cm (W) × ${product.height || ''} cm (H)` }] : []),
    ...(product?.sku ? [{ label: 'SKU', value: product.sku }] : []),
    ...(product?.category?.name ? [{ label: 'Category', value: product.category.name }] : []),
    { label: 'Availability', value: stockQuantity > 0 ? `${stockQuantity} In Stock` : 'Out of stock' }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        <nav className="text-xs text-gray-500 flex items-center gap-2 mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#7A0C1E]">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-[#7A0C1E]">Shop</Link>
          <span>›</span>
          {product.category?.name && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#7A0C1E]">
                {product.category.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-[#7A0C1E] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 shrink-0">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'border-[#7A0C1E] shadow-sm scale-105' : 'border-[#E8DACD] opacity-70'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#E8DACD] shadow-xs group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="flex h-full w-full"
                  animate={{ x: `-${selectedImageIndex * 100}%` }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative w-full h-full shrink-0">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                {(product.is_new_arrival || product.is_new) && (
                  <span className="bg-[#7A0C1E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                    New
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-[#5C3D8F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                    Featured
                  </span>
                )}
                {(product.is_best_seller || product.is_bestseller) && (
                  <span className="bg-[#A87B39] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                    Bestseller
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 flex flex-col gap-3.5 z-10">
                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product)}
                  className="text-[#2B1B17] hover:text-[#7A0C1E] hover:scale-110 active:scale-90 transition-all cursor-pointer drop-shadow-sm"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 transition-colors ${
                    (product && (isInWishlist(product.id || product._id))) ? 'fill-[#7A0C1E] text-[#7A0C1E]' : 'text-[#2B1B17]'
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

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2B1B17] hover:text-[#7A0C1E] shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2B1B17] hover:text-[#7A0C1E] shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>


              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-[#A87B39]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#A87B39]" />
                  ))}
                  <span className="font-bold text-[#2B1B17] ml-1">{avgRatingScore}</span>
                  <span className="text-gray-400">({totalReviewsCount} reviews)</span>
                </div>
                  {product.sku && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-[#705B54] font-medium font-mono">SKU: {product.sku}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#2B1B17]">
                  {formatPrice(effectivePrice)}
                </span>
                {originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <div>
                  {renderFormattedDescription(product.description)}
                </div>
              )}

            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-[#E8DACD] text-[11px] text-[#705B54]">
              <span className={`flex items-center gap-1 font-bold ${stockQuantity > 0 ? 'text-green-700' : 'text-rose-600'}`}>
                ● {stockQuantity > 0 ? `In Stock (${stockQuantity} units)` : 'Out of Stock'}
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#7A0C1E]" />
                {enableFreeShipping ? `Free Shipping over ${formatPrice(freeShippingThreshold)}` : `Flat Shipping ${formatPrice(flatShippingRate)}`}
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#7A0C1E]" />
                30-Day Returns
              </span>
            </div>

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

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => product && addToCart(product, quantity)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (product) {
                    addToCart(product, quantity);
                    window.location.href = '/cart';
                  }
                }}
                className="w-full py-3 bg-white border border-[#E8DACD] text-[#2B1B17] hover:bg-[#F2E6DA] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Buy Now
              </button>
            </div>

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

        <div className="mt-16 bg-white rounded-2xl border border-[#E8DACD] p-6 sm:p-10 shadow-sm">
          <div className="flex border-b border-[#E8DACD] gap-8 text-xs font-bold text-gray-400 overflow-x-auto no-scrollbar pb-3 mb-6 relative">
            {['specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`uppercase tracking-wider transition-colors pb-3 relative ${
                  activeTab === tab ? 'text-[#7A0C1E]' : 'hover:text-[#2B1B17]'
                }`}
              >
                <span>{tab === 'shipping' ? 'Shipping & Returns' : tab === 'reviews' ? `Reviews (${totalReviewsCount})` : tab}</span>
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

              {activeTab === 'specifications' && (
                <div className="max-w-md">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      {specsList.map((spec, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2.5 text-gray-400 font-medium">{spec.label}</td>
                          <td className="py-2.5 font-bold text-[#2B1B17]">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#E8DACD]/60 pb-8">
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-[#FAF5EF]/60 p-6 rounded-xl border border-[#E8DACD]/40 text-center">
                      <span className="text-4xl font-bold text-[#2B1B17]">{avgRatingScore}</span>
                      <div className="flex items-center gap-1 text-[#A87B39] my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#A87B39]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#705B54]">Based on {totalReviewsCount} ratings</span>
                    </div>

                    <div className="md:col-span-8 space-y-2.5 flex flex-col justify-center">
                      {starCounts.map((row) => (
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

                  <div className="space-y-6">
                    <h4 className="font-serif-luxury text-lg font-bold text-[#2B1B17] mb-4">Customer Reviews</h4>
                    {reviewsList.length === 0 ? (
                      <div className="bg-[#FAF5EF]/50 border border-[#E8DACD]/60 rounded-2xl p-8 text-center text-[#705B54]">
                        <p className="font-bold text-sm text-[#2B1B17]">No customer reviews yet for this product.</p>
                        <p className="text-xs mt-1 text-[#705B54]">Be the first customer to share your experience!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E8DACD]/40 space-y-6">
                        {reviewsList.map((rev, idx) => (
                          <div key={rev.id || rev._id || idx} className="pt-6 first:pt-0">
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#7A0C1E] text-white flex items-center justify-center font-bold text-xs uppercase">
                                  {(rev.user?.name || 'Customer').charAt(0)}
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-[#2B1B17]">{rev.user?.name || 'Verified Customer'}</span>
                                  <span className="block text-[10px] text-gray-400">
                                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-0.5 text-[#A87B39]">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-[#A87B39]' : 'text-gray-300 fill-none'} text-[#A87B39]`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed sm:pl-11">
                              {rev.review || rev.comment}
                            </p>
                            {rev.admin_reply && (
                              <div className="mt-3 ml-11 p-3 bg-[#FAF5EF] rounded-xl border border-[#E8DACD]/60 text-xs">
                                <span className="font-bold text-[#7A0C1E] block mb-1">Response from Fleur Notes:</span>
                                <p className="text-gray-600">{rev.admin_reply}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3 text-xs text-gray-600 leading-relaxed max-w-2xl">
                  <h4 className="font-bold text-[#2B1B17]">Standard Delivery</h4>
                  <p>Orders are dispatched within 24-48 business hours. Standard delivery usually arrives within 3-5 business days across India.</p>
                  <h4 className="font-bold text-[#2B1B17] mt-4">Easy Returns</h4>
                  <p>If you receive a damaged product or want a replacement, submit a return request within 5 days of delivery.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-16">
          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17] mb-6">You may also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p, idx) => (
              <ProductCard key={p._id || p.id || `related-${idx}`} product={p} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
