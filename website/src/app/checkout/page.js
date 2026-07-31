'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Wallet,
  ChevronRight,
  Plus,
  Check,
  Truck,
  Tag,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/utils/formatPrice';
import { extractProductImage } from '@/utils/formatImage';
import { productService } from '@/services/productService';
import { addressService } from '@/services/addressService';
import { orderService } from '@/services/orderService';

import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';

export default function CheckoutPage() {
  const { freeShippingThreshold, flatShippingRate, enableFreeShipping, taxRate } = useSettings();
  const { setCartCount } = useShop();

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // upi, card, cod (default cod)
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderId, setOrderId] = useState('');

  // UPI State
  const [vpa, setVpa] = useState('');
  // Card State
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Cart Items from localStorage
  const [cartItems, setCartItems] = useState([]);

  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('user_token'));

  React.useEffect(() => {
    // 1. Load Dynamic User Saved Addresses from API or localStorage
    async function loadUserAddresses() {
      try {
        const apiAddresses = await addressService.getAddresses();
        if (Array.isArray(apiAddresses) && apiAddresses.length > 0) {
          setSavedAddresses(apiAddresses);
          setSelectedAddressId(apiAddresses[0].id);
          setUseNewAddress(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching user addresses via API:', err);
      }

      const savedUserDataStr = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
      let currentUserData = user;
      if (!currentUserData && savedUserDataStr) {
        try {
          currentUserData = JSON.parse(savedUserDataStr);
        } catch (e) {}
      }

      if (currentUserData) {
        const userAddresses = [];
        const userName = currentUserData.name || currentUserData.fullName || '';
        const userPhone = currentUserData.phone || currentUserData.mobile || '';

        if (Array.isArray(currentUserData.addresses) && currentUserData.addresses.length > 0) {
          currentUserData.addresses.forEach((addr, idx) => {
            userAddresses.push({
              id: addr.id || addr._id || `addr-${idx + 1}`,
              name: addr.name || userName,
              phone: addr.phone || userPhone,
              type: addr.type || (idx === 0 ? 'Home' : 'Office'),
              address: addr.address_line1 || addr.address || '',
              landmark: addr.landmark || addr.address_line2 || '',
              city: addr.city || '',
              state: addr.state || '',
              pinCode: addr.pincode || addr.pinCode || addr.zipCode || ''
            });
          });
        } else if (currentUserData.address) {
          userAddresses.push({
            id: 'addr-user-primary',
            name: userName,
            phone: userPhone,
            type: 'Home',
            address: currentUserData.address,
            landmark: '',
            city: currentUserData.city || '',
            state: currentUserData.state || '',
            pinCode: currentUserData.pincode || currentUserData.pinCode || ''
          });
        }

        setSavedAddresses(userAddresses);
        if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0].id);
          setUseNewAddress(false);
        } else {
          setSelectedAddressId('');
          setUseNewAddress(true);
        }
      } else {
        setSavedAddresses([]);
        setSelectedAddressId('');
        setUseNewAddress(true);
      }
    }
    loadUserAddresses();

    // 2. Sync Applied Coupon from Cart Screen
    const savedCoupon = typeof window !== 'undefined' ? localStorage.getItem('applied_coupon') : null;
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code && parsed?.discount) {
          setPromoCode(parsed.code);
          setAppliedDiscount(parsed.discount);
          setPromoSuccess(`Coupon ${parsed.code} applied! (${parsed.discount}% OFF)`);
        }
      } catch (e) {
        console.error('Failed to parse applied coupon:', e);
      }
    }

    async function syncCheckoutItems() {
      try {
        const response = await productService.getProducts({ limit: 50, status: 'active' });
        const realProducts = response?.data || [];
        const savedCart = localStorage.getItem('cart_items');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map((it) => {
              const matchedProduct = realProducts.find((p) => {
                const pId = String(p._id || p.id);
                const rawItId = String(it.productId || it.id).replace(/^cart-/, '');
                return pId === rawItId || p.slug === it.slug || (p.name && it.name && p.name.trim().toLowerCase() === it.name.trim().toLowerCase());
              });
              return {
                ...it,
                image: matchedProduct ? extractProductImage(matchedProduct) : extractProductImage(it)
              };
            });
            setCartItems(normalized);
          }
        }
      } catch (e) {
        console.error('Failed to parse cart items for checkout:', e);
      }
    }
    syncCheckoutItems();
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = enableFreeShipping && subtotal >= freeShippingThreshold;
  const shippingCost = subtotal === 0 || isFreeShipping ? 0 : flatShippingRate;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const currentTaxRate = taxRate !== undefined && taxRate !== null ? taxRate : 18;
  const taxAmount = (subtotal - discountAmount) * (currentTaxRate / 100);
  const grandTotal = subtotal - discountAmount + shippingCost + taxAmount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.toUpperCase() === 'FLEUR NOTES20') {
      setAppliedDiscount(20);
      setPromoSuccess('');
    } else if (promoCode.toUpperCase() === 'WELCOME15') {
      setAppliedDiscount(15);
      setPromoSuccess('');
    } else if (promoCode) {
      setPromoError('Invalid promo code');
    }
  };

  const removeCoupon = () => {
    setPromoCode('');
    setAppliedDiscount(0);
    setPromoSuccess('');
    setPromoError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
    if (!isLoggedIn && !token) {
      setCheckoutError('Please sign in to place your order.');
      return;
    }

    let newAddressPayload = null;
    let activeAddressId = selectedAddressId;

    if (!useNewAddress) {
      if (!activeAddressId && savedAddresses.length > 0) {
        activeAddressId = savedAddresses[0].id;
        setSelectedAddressId(savedAddresses[0].id);
      } else if (!activeAddressId && savedAddresses.length === 0) {
        setUseNewAddress(true);
      }
    }

    // Validation if custom address is chosen
    if (useNewAddress) {
      const { firstName, lastName, address, city, state, pinCode, phone } = shippingAddress;
      if (!firstName || !address || !city || !state || !pinCode || !phone) {
        setCheckoutError('Please fill out all required shipping fields (First Name, Street Address, City, State, PIN Code, Phone).');
        return;
      }
      newAddressPayload = {
        fullName: `${firstName} ${lastName}`.trim(),
        phone,
        addressLine1: address,
        city,
        state,
        pinCode,
        label: 'home'
      };
    }

    if (paymentMethod === 'upi' && !vpa) {
      setCheckoutError('Please enter your UPI ID (VPA).');
      return;
    }

    if (paymentMethod === 'card') {
      const { number, name, expiry, cvv } = cardDetails;
      if (!number || !name || !expiry || !cvv) {
        setCheckoutError('Please fill out card payment details.');
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const orderPayload = {
        address_id: useNewAddress ? null : activeAddressId,
        new_address: newAddressPayload,
        payment_method: paymentMethod,
        coupon_code: promoCode || null,
        items: cartItems.map(item => ({
          product_id: item.productId || item._id || item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await orderService.placeOrder(orderPayload);

      setIsPlacingOrder(false);

      if (response && response.success) {
        const generatedOrderId = response.data?.orderNumber || response.data?.orderId || `FN-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderCompleted(true);
        setOrderId(generatedOrderId);

        // 1. Empty Cart
        try {
          localStorage.removeItem('cart_items');
        } catch (e) {}
        setCartItems([]);
        if (setCartCount) setCartCount(0);

        // 2. Record coupon usage and clear applied coupon
        if (promoCode) {
          try {
            const used = JSON.parse(localStorage.getItem('used_coupons') || '[]');
            const upperCode = promoCode.trim().toUpperCase();
            if (!used.includes(upperCode)) {
              used.push(upperCode);
              localStorage.setItem('used_coupons', JSON.stringify(used));
            }
          } catch (e) {}
        }
        try {
          localStorage.removeItem('applied_coupon');
        } catch (e) {}
      } else {
        setCheckoutError(response?.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setIsPlacingOrder(false);
      console.error('Place order exception:', err);
      setCheckoutError('An error occurred while placing your order.');
    }
  };

  if (!authLoading && !isLoggedIn && !hasToken) {
    return (
      <div className="bg-[#FAF5EF] min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DACD] p-8 shadow-sm text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#7A0C1E]/10 text-[#7A0C1E] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Sign In Required</h2>
          <p className="text-xs text-[#705B54]">
            Please sign in or create an account to proceed to checkout and complete your order.
          </p>
          <Link
            href="/auth/login?redirect=/checkout"
            className="inline-flex items-center justify-center w-full py-3.5 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Sign In to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-[#7A0C1E]">Home</Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-[#7A0C1E]">Cart</Link>
          <span>›</span>
          <span className="text-[#7A0C1E] font-medium">Checkout</span>
        </nav>

        <h1 className="font-serif-luxury text-3xl font-bold text-[#2B1B17] mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Details & Payment (Lg: 7 columns) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Address Selection */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DACD] shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-[#E8DACD]/40 pb-3">
                <h2 className="font-serif-luxury text-lg font-bold text-[#2B1B17]">
                  1. Shipping Address
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(false)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${!useNewAddress
                      ? 'bg-[#7A0C1E] text-white border-[#7A0C1E]'
                      : 'border-[#E8DACD] text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Saved Addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${useNewAddress
                      ? 'bg-[#7A0C1E] text-white border-[#7A0C1E]'
                      : 'border-[#E8DACD] text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    New Address
                  </button>
                </div>
              </div>

              {!useNewAddress ? (
                savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id
                          ? 'border-[#7A0C1E] bg-[#FAF5EF]/30'
                          : 'border-[#E8DACD] bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD]">
                            {addr.type}
                          </span>
                          {selectedAddressId === addr.id && (
                            <div className="w-4 h-4 rounded-full bg-[#7A0C1E] flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#2B1B17]">{addr.name}</h4>
                        <p className="text-[11px] text-[#705B54] mt-1.5 leading-relaxed">
                          {addr.address}, {addr.landmark && `${addr.landmark}, `}
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <span className="block text-[10px] text-gray-400 mt-2 font-medium">
                          {addr.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-[#E8DACD] rounded-xl">
                    <p className="text-xs text-gray-500 mb-3">No saved addresses found.</p>
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(true)}
                      className="px-4 py-2 text-xs font-bold bg-[#7A0C1E] text-white rounded-xl hover:bg-[#5F0917] transition-colors"
                    >
                      Add New Address
                    </button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      placeholder="Jane"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      placeholder="House No, Building, Street Name"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Apartment, Suite (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      placeholder="Flat 4B"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Kolkata"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="West Bengal"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={shippingAddress.pinCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pinCode: e.target.value })}
                      placeholder="700016"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Selection */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DACD] shadow-xs">
              <h2 className="font-serif-luxury text-lg font-bold text-[#2B1B17] mb-4 border-b border-[#E8DACD]/40 pb-3">
                2. Payment Method
              </h2>

              <div className="space-y-4">
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'upi'
                    ? 'border-[#7A0C1E] bg-[#FAF5EF]/30'
                    : 'border-[#E8DACD] hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Wallet className="w-5 h-5 text-[#7A0C1E]" />
                      <span className="text-xs font-bold text-[#2B1B17]">UPI (Paytm, PhonePe, GPay)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-[#7A0C1E] border-[#7A0C1E] text-white' : 'border-gray-300'
                      }`}>
                      {paymentMethod === 'upi' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-3 border-t border-[#E8DACD]/60 space-y-3">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">UPI ID / VPA</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vpa}
                          onChange={(e) => setVpa(e.target.value)}
                          placeholder="username@okaxis"
                          className="flex-1 bg-white border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">A payment request will be sent to your UPI app.</p>
                    </div>
                  )}
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'card'
                    ? 'border-[#7A0C1E] bg-[#FAF5EF]/30'
                    : 'border-[#E8DACD] hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#7A0C1E]" />
                      <span className="text-xs font-bold text-[#2B1B17]">Credit / Debit Card</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'bg-[#7A0C1E] border-[#7A0C1E] text-white' : 'border-gray-300'
                      }`}>
                      {paymentMethod === 'card' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-3 border-t border-[#E8DACD]/60 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={16}
                          className="w-full bg-white border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          placeholder="Jane Doe"
                          className="w-full bg-white border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            placeholder="•••"
                            maxLength={3}
                            className="w-full bg-white border border-[#E8DACD] rounded-xl px-4 py-2.5 text-xs text-[#2B1B17] focus:outline-none focus:border-[#7A0C1E]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod'
                    ? 'border-[#7A0C1E] bg-[#FAF5EF]/30'
                    : 'border-[#E8DACD] hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-[#7A0C1E]" />
                      <span className="text-xs font-bold text-[#2B1B17]">Cash on Delivery (COD)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-[#7A0C1E] border-[#7A0C1E] text-white' : 'border-gray-300'
                      }`}>
                      {paymentMethod === 'cod' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="mt-3 text-[10px] text-gray-500 pl-7">Pay with cash upon delivery of your boutique order.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Error Card Banner */}
            {checkoutError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-700 animate-fadeIn shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-red-900 uppercase tracking-wider">Payment / Field Required</p>
                    <p className="text-xs text-red-700 font-semibold mt-0.5">{checkoutError}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutError('')}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                  title="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isPlacingOrder ? 'Processing Payment...' : `Pay & Place Order • ${formatPrice(grandTotal)}`}</span>
            </button>
          </div>

          {/* Right Column: Order Summary (Lg: 5 columns) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Promo Code Block */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DACD] shadow-xs">
              {appliedDiscount > 0 && promoCode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-[#2B1B17] uppercase tracking-wider">Coupon Applied</span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 uppercase">
                      Applied
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#FAF5EF] p-3 rounded-xl border border-[#E8DACD]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#7A0C1E] text-white">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#7A0C1E] uppercase">{promoCode}</span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                            {appliedDiscount}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium pt-0.5">Coupon successfully applied</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        try {
                          localStorage.removeItem('applied_coupon');
                        } catch (e) {}
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Remove Coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="block text-xs font-bold text-[#2B1B17] uppercase tracking-wider mb-2">Apply Promo Code</span>
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. FLEUR NOTES10"
                        className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl pl-4 pr-8 py-2 text-xs text-[#2B1B17] uppercase focus:outline-none focus:border-[#7A0C1E]"
                      />
                      {promoCode && (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                          title="Remove coupon"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2B1B17] hover:bg-[#7A0C1E] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                  {promoSuccess && <p className="text-[10px] text-green-700 font-semibold mt-2">{promoSuccess}</p>}
                  {promoError && <p className="text-[10px] text-red-600 font-semibold mt-2">{promoError}</p>}
                </>
              )}
            </div>

            {/* Cart Items Summary */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DACD] shadow-xs">
              <h3 className="font-serif-luxury text-base font-bold text-[#2B1B17] mb-4 pb-3 border-b border-[#E8DACD]/40">
                Order Summary
              </h3>

              <div className="divide-y divide-[#E8DACD]/30 max-h-[280px] overflow-y-auto pr-1 no-scrollbar space-y-4 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pt-4 first:pt-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E8DACD] bg-[#FAF5EF] shrink-0">
                      <img src={extractProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#2B1B17] truncate">{item.name}</h4>
                      <span className="block text-[10px] text-gray-400">Qty: {item.quantity}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#2B1B17] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Calculation Lines */}
              <div className="mt-6 pt-4 border-t border-[#E8DACD]/60 space-y-2.5 text-xs text-[#705B54]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2B1B17]">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Promo Discount ({appliedDiscount}%)
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-[#2B1B17]">{formatPrice(shippingCost)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>GST / Taxes ({currentTaxRate}%)</span>
                  <span className="font-semibold text-[#2B1B17]">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E8DACD]/60 text-sm font-bold text-[#2B1B17]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#7A0C1E]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Security Shield badge */}
              <div className="mt-6 flex items-center gap-2.5 bg-[#FAF5EF]/60 p-3.5 rounded-xl border border-[#E8DACD]/30">
                <ShieldCheck className="w-5 h-5 text-green-700 shrink-0" />
                <p className="text-[10px] text-gray-500 leading-normal">
                  Your transaction is fully secured with 256-bit encryption routing.
                </p>
              </div>
            </div>

          </div>

        </div>
      </Container>

      {/* Confirmation Modal overlay */}
      {orderCompleted && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E8DACD] shadow-xl text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A87B39] flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-[#A87B39]" />
                Thank you for your order!
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Order Placed Successfully</h2>
              <p className="text-xs text-[#705B54]">We have sent a receipt with tracking info to your email.</p>
            </div>

            <div className="bg-[#FAF5EF] rounded-2xl p-4 border border-[#E8DACD] text-left divide-y divide-[#E8DACD]/40 space-y-3">
              <div className="flex justify-between text-xs pt-1 first:pt-0">
                <span className="text-gray-400">Order ID</span>
                <span className="font-bold text-[#2B1B17]">{orderId}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-gray-400">Estimated Delivery</span>
                <span className="font-bold text-[#2B1B17] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#7A0C1E]" />
                  3-5 Business Days
                </span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-gray-400">Total Paid</span>
                <span className="font-bold text-[#7A0C1E]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/shop"
                className="w-full bg-[#7A0C1E] hover:bg-[#5F0917] text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-xs block text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/profile"
                className="w-full border border-[#E8DACD] hover:bg-gray-50 text-[#2B1B17] py-3 rounded-xl font-semibold text-xs transition-all block text-center"
              >
                Go to Profile Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
