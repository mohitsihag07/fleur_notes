'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  Gift,
  X
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { productService } from '@/services/productService';
import { couponService } from '@/services/couponService';
import { getFormattedImage, extractProductImage } from '@/utils/formatImage';
import { formatPrice } from '@/utils/formatPrice';
import { useShop } from '@/context/ShopContext';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { freeShippingThreshold, flatShippingRate, enableFreeShipping, taxRate } = useSettings();
  const { setCartCount, removeFromCart, updateCartQuantity, clearCart: clearShopCart } = useShop();
  const { isLoggedIn } = useAuth();
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('user_token'));
  const checkoutHref = isLoggedIn || hasToken ? '/checkout' : '/auth/login?redirect=/checkout';
  const [cartItems, setCartItems] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

  React.useEffect(() => {
    async function fetchCoupons() {
      try {
        const fetched = await couponService.getCoupons();
        const usedCoupons = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('used_coupons') || '[]') : [];
        const activeNotUsed = (Array.isArray(fetched) ? fetched : []).filter(
          (c) => !usedCoupons.includes(c.code?.toUpperCase())
        );
        setAvailableCoupons(activeNotUsed);
      } catch (err) {
        console.error('Failed to load coupons:', err);
      }
    }
    fetchCoupons();
  }, []);

  React.useEffect(() => {
    async function loadCartData() {
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
              id: `cart-${p.id || p._id}`,
              productId: p.id || p._id,
              name: p.name,
              slug: p.slug || p.id || p._id,
              color: p.category_id?.name || '',
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              quantity: 1,
              image: getFormattedImage(imgUrl),
              inStock: true,
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: 4.8
            };
          });

          setFrequentlyBought(formatted.slice(3, 7));
        }

        const savedCart = localStorage.getItem('cart_items');
        if (savedCart !== null) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              const normalized = parsed.map((it) => {
                const matchedProduct = realProducts.find((p) => {
                  const pId = String(p._id || p.id);
                  const rawItId = String(it.productId || it.id).replace(/^cart-/, '');
                  return pId === rawItId || p.slug === it.slug || (p.name && it.name && p.name.trim().toLowerCase() === it.name.trim().toLowerCase());
                });

                let dynamicImg = it.image;
                if (matchedProduct) {
                  dynamicImg = extractProductImage(matchedProduct);
                } else if (!dynamicImg) {
                  dynamicImg = extractProductImage(it);
                }

                return {
                  ...it,
                  image: getFormattedImage(dynamicImg)
                };
              });
              setCartItems(normalized);
              localStorage.setItem('cart_items', JSON.stringify(normalized));
            } else {
              setCartItems([]);
            }
          } catch (e) {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }

        const savedCoupon = localStorage.getItem('applied_coupon');
        if (savedCoupon) {
          try {
            const parsed = JSON.parse(savedCoupon);
            if (parsed?.code && parsed?.discount) {
              setPromoCode(parsed.code);
              setAppliedDiscount(parsed.discount);
              setPromoSuccess(`Coupon ${parsed.code} applied! (${parsed.discount}% OFF)`);
            }
          } catch (e) {
            console.error('Error parsing saved coupon:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load cart products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCartData();
  }, []);

  const saveCartState = (items) => {
    setCartItems(items);
    localStorage.setItem('cart_items', JSON.stringify(items));
    const totalCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    setCartCount(totalCount);
  };

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Quantity updates
  const updateQuantity = async (id, delta) => {
    const targetItem = cartItems.find((item) => item.id === id);
    if (!targetItem) return;

    const newQty = targetItem.quantity + delta;
    const pId = targetItem.productId || targetItem.id;

    if (newQty <= 0) {
      await removeItem(id);
      return;
    }

    const updated = await updateCartQuantity(pId, newQty);
    if (Array.isArray(updated)) {
      setCartItems(updated);
    } else {
      const nextCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQty } : item));
      saveCartState(nextCart);
    }
  };

  const removeItem = async (id) => {
    const targetItem = cartItems.find((item) => item.id === id);
    const pId = targetItem ? (targetItem.productId || targetItem.id) : id;

    const updated = await removeFromCart(pId);
    if (Array.isArray(updated)) {
      setCartItems(updated);
    } else {
      const nextCart = cartItems.filter((item) => item.id !== id);
      saveCartState(nextCart);
    }
  };

  const clearCart = async () => {
    await clearShopCart();
    setCartItems([]);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = enableFreeShipping && subtotal >= freeShippingThreshold;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = subtotal === 0 || isFreeShipping ? 0 : flatShippingRate;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const currentTaxRate = taxRate !== undefined && taxRate !== null ? taxRate : 18;
  const estimatedTax = (subtotal - discountAmount) * (currentTaxRate / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);

  // Auto re-validate applied coupon whenever subtotal or availableCoupons change
  React.useEffect(() => {
    if (!promoCode || availableCoupons.length === 0) return;
    const cleanCode = promoCode.trim().toUpperCase();
    const foundCoupon = availableCoupons.find((c) => c.code?.toUpperCase() === cleanCode);

    if (foundCoupon && foundCoupon.minAmount && subtotal < foundCoupon.minAmount) {
      setAppliedDiscount(0);
      setPromoSuccess('');
      setPromoError(`Minimum spend of ${formatPrice(foundCoupon.minAmount)} required for ${cleanCode}.`);
      try {
        localStorage.removeItem('applied_coupon');
      } catch (e) {}
    } else if (foundCoupon && (!foundCoupon.minAmount || subtotal >= foundCoupon.minAmount)) {
      const discountVal = foundCoupon.value || (foundCoupon.type === 'percentage' ? foundCoupon.value : 10);
      setAppliedDiscount(discountVal);
      setPromoSuccess(`Coupon ${cleanCode} applied! (${foundCoupon.discountText || `${discountVal}% OFF`})`);
      setPromoError('');
    }
  }, [subtotal, availableCoupons, promoCode]);

  const applyCouponCode = (targetCode) => {
    const cleanCode = targetCode ? targetCode.trim().toUpperCase() : '';
    if (!cleanCode) {
      setPromoError('Please enter a coupon code.');
      setPromoSuccess('');
      setAppliedDiscount(0);
      return;
    }

    const usedCoupons = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('used_coupons') || '[]') : [];
    if (usedCoupons.includes(cleanCode)) {
      setPromoError(`You have already used coupon code "${cleanCode}".`);
      setPromoSuccess('');
      setAppliedDiscount(0);
      try {
        localStorage.removeItem('applied_coupon');
      } catch (e) {}
      return;
    }

    const foundCoupon = availableCoupons.find((c) => c.code?.toUpperCase() === cleanCode);

    if (foundCoupon) {
      if (foundCoupon.minAmount && subtotal < foundCoupon.minAmount) {
        setPromoError(`Minimum spend of ${formatPrice(foundCoupon.minAmount)} required for ${cleanCode}.`);
        setPromoSuccess('');
        setAppliedDiscount(0);
        setPromoCode(cleanCode);
        try {
          localStorage.removeItem('applied_coupon');
        } catch (e) {}
        return;
      }

      const discountVal = foundCoupon.value || (foundCoupon.type === 'percentage' ? foundCoupon.value : 10);
      setAppliedDiscount(discountVal);
      setPromoSuccess(`Coupon ${cleanCode} applied! (${foundCoupon.discountText || `${discountVal}% OFF`})`);
      setPromoError('');
      setPromoCode(cleanCode);
      setIsCouponsModalOpen(false);
      try {
        localStorage.setItem('applied_coupon', JSON.stringify({ code: cleanCode, discount: discountVal }));
      } catch (e) {}
    } else {
      setPromoError(`Invalid or inactive coupon code: "${cleanCode}".`);
      setPromoSuccess('');
      setAppliedDiscount(0);
      try {
        localStorage.removeItem('applied_coupon');
      } catch (e) {}
    }
  };

  const removeCoupon = () => {
    setPromoCode('');
    setAppliedDiscount(0);
    setPromoSuccess('');
    setPromoError('');
    try {
      localStorage.removeItem('applied_coupon');
    } catch (e) {}
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    applyCouponCode(promoCode);
  };

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8DACD]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>YOUR SHOPPING BAG</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2B1B17]">
              Shopping Cart
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7A0C1E] bg-[#F2E6DA] px-3 py-1.5 rounded-full border border-[#E8DACD]">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-[#E8DACD] p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-12">
            <div className="w-16 h-16 rounded-full bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-center mx-auto text-[#7A0C1E]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-[#705B54] max-w-xs mx-auto">
              Looks like you haven't added any handcrafted treasures to your cart yet.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 py-3 px-6 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Collection</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Indicator */}
              <div className="bg-[#F2E6DA] rounded-2xl border border-[#E8DACD] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2B1B17]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#7A0C1E]" />
                    {amountForFreeShipping > 0 ? (
                      <span>
                        Add <strong className="text-[#7A0C1E]">{formatPrice(amountForFreeShipping)}</strong> more to qualify for <strong>FREE Shipping</strong>!
                      </span>
                    ) : (
                      <span className="text-green-700 font-bold">🎉 Congratulations! You qualify for FREE Shipping!</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#705B54] font-normal">Threshold {formatPrice(freeShippingThreshold)}</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E8DACD]/60">
                  <div
                    className="h-full bg-[#7A0C1E] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-[#E8DACD] shadow-sm overflow-hidden divide-y divide-[#E8DACD]/60">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Image & Product Title */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF5EF] border border-[#E8DACD] shrink-0 flex items-center justify-center">
                        {extractProductImage(item) ? (
                          <img
                            src={extractProductImage(item)}
                            alt={item.name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <Link href={`/product/${item.slug}`} className="font-semibold text-sm sm:text-base text-[#2B1B17] hover:text-[#7A0C1E] transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500">Color/Option: <span className="text-[#2B1B17] font-medium">{item.color}</span></p>
                        <p className="font-bold text-sm text-[#2B1B17] sm:hidden">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    {/* Quantity & Subtotal Controls */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DACD]/50">
                      <div className="hidden sm:block text-right">
                        <span className="font-bold text-sm text-[#2B1B17] block">{formatPrice(item.price)}</span>
                        <span className="text-[10px] text-gray-400">per item</span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="inline-flex items-center border border-[#E8DACD] rounded-xl bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 text-gray-500 hover:text-[#2B1B17]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#2B1B17]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 text-gray-500 hover:text-[#2B1B17]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-sm text-[#7A0C1E] block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Delete Icon */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A0C1E] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear Shopping Cart
                </button>
              </div>

              {/* Gift Note Box */}
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2B1B17]">
                  <Gift className="w-4 h-4 text-[#7A0C1E]" />
                  <span>Add a Free Gift Message (Optional)</span>
                </div>
                <textarea
                  rows={3}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Write a personal note to include inside the gift box..."
                  className="w-full p-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] resize-none"
                />
              </div>
            </div>

            {/* Right Order Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-6 sticky top-24">
                <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17] pb-3 border-b border-[#E8DACD]">
                  Order Summary
                </h3>

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#2B1B17]">{formatPrice(subtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Discount ({appliedDiscount}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-[#2B1B17]">
                      {shippingCost === 0 ? <strong className="text-green-700 uppercase">Free</strong> : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax ({currentTaxRate}%)</span>
                    <span className="font-semibold text-[#2B1B17]">{formatPrice(estimatedTax)}</span>
                  </div>

                  <div className="pt-3 border-t border-[#E8DACD] flex justify-between items-center text-sm font-bold text-[#2B1B17]">
                    <span>Total</span>
                    <span className="text-xl text-[#7A0C1E]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-[#E8DACD]">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-[#2B1B17]">Promo Code / Coupon</label>
                    <button
                      type="button"
                      onClick={() => setIsCouponsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7A0C1E] hover:text-[#5F0917] hover:underline cursor-pointer bg-[#F2E6DA] px-2.5 py-1 rounded-lg border border-[#E8DACD] transition-colors"
                    >
                      <Tag className="w-3 h-3 text-[#7A0C1E]" />
                      <span>Available Coupons ({availableCoupons.length})</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. FLEUR NOTES10"
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#E8DACD] outline-none uppercase font-semibold text-[#2B1B17]"
                      />
                      {promoCode && (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Remove coupon"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl hover:bg-[#5F0917] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoSuccess && <p className="text-[11px] font-semibold text-green-700">{promoSuccess}</p>}
                  {promoError && <p className="text-[11px] font-semibold text-red-500">{promoError}</p>}
                </form>

                {/* Checkout CTA */}
                <div className="pt-2">
                  <Link
                    href={checkoutHref}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-[#E8DACD] space-y-2.5 text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#7A0C1E] shrink-0" />
                    <span>100% Encrypted & Safe Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#7A0C1E] shrink-0" />
                    <span>-Day Hassle-Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frequently Bought Together Section with Real Products */}
        {frequentlyBought.length > 0 && (
          <div className="mt-20 pt-10 border-t border-[#E8DACD]">
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17] mb-6">
              Frequently Bought Together
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {frequentlyBought.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Available Coupons Modal */}
        {isCouponsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E8DACD] shadow-2xl max-w-md w-full p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#E8DACD] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#F2E6DA] text-[#7A0C1E]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2B1B17]">Available Coupons</h3>
                    <p className="text-[11px] text-gray-500">Click Apply to use a coupon code</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCouponsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {availableCoupons.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">No coupons available at the moment.</p>
                ) : (
                  availableCoupons.map((coupon, idx) => {
                    const isMinMet = !coupon.minAmount || subtotal >= coupon.minAmount;
                    return (
                      <div
                        key={coupon.id || coupon.code || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isMinMet
                            ? 'border-[#E8DACD] bg-[#FAF5EF] hover:border-[#7A0C1E]/50'
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#7A0C1E] text-white tracking-wider">
                                {coupon.code}
                              </span>
                              <span className="text-xs font-bold text-[#7A0C1E] bg-[#F2E6DA] px-2 py-0.5 rounded-md">
                                {coupon.discountText || `${coupon.value}% OFF`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium pt-1">
                              {coupon.description || `Get discount on your order.`}
                            </p>
                            {coupon.minAmount > 0 && (
                              <p className="text-[10px] text-gray-400">
                                Min. Spend: <strong>{formatPrice(coupon.minAmount)}</strong>
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => applyCouponCode(coupon.code)}
                            disabled={!isMinMet}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isMinMet
                                ? 'bg-[#7A0C1E] text-white hover:bg-[#5F0917]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
