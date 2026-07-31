'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { getBackendURL } from '@/services/api';
import { getFormattedImage } from '@/utils/formatImage';
import { useAuth } from '@/context/AuthContext';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Return / Exchange Form State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnType, setReturnType] = useState('return'); // return, exchange
  const [returnReason, setReturnReason] = useState('Defective or Damaged product');
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
        if (!savedToken) {
          router.push('/auth/login');
          return;
        }

        const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
        const res = await fetch(`${backendUrl}/api/users/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        const data = await res.json();
        if (data?.success && data?.data) {
          setOrder(data.data);
        } else {
          setError(data?.message || 'Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) {
      fetchOrderDetails();
    }
  }, [id, isLoggedIn, router]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setSubmittingReturn(true);
    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';

      const res = await fetch(`${backendUrl}/api/users/orders/${id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          return_type: returnType,
          return_reason: returnReason,
          return_notes: returnNotes
        })
      });

      const data = await res.json();
      if (data?.success) {
        setReturnSuccessMsg(`Your ${returnType === 'exchange' ? 'exchange' : 'return'} request has been submitted successfully!`);
        setIsReturnModalOpen(false);

        // Update local order state
        setOrder((prev) => ({
          ...prev,
          status: 'Return Requested',
          rawStatus: 'return_requested',
          returnType: returnType,
          returnReason: returnReason,
          returnNotes: returnNotes,
          returnRequestedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        }));
      } else {
        alert(data?.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error('Error submitting return request:', err);
      alert('An error occurred while submitting your return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-[#7A0C1E]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-semibold text-[#705B54]">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] py-16">
        <Container>
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E8DACD] p-8 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Order Not Found</h2>
            <p className="text-xs text-[#705B54]">{error || 'We could not find the requested order details.'}</p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5F0917] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Your Orders</span>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E8DACD]">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Link href="/profile" className="hover:text-[#7A0C1E]">Your Profile</Link>
              <span>›</span>
              <span className="text-[#7A0C1E] font-semibold">Order Details</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="p-2 bg-white border border-[#E8DACD] rounded-xl text-gray-600 hover:text-[#7A0C1E] hover:border-[#7A0C1E] transition-colors"
                title="Back to Orders"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
                  Order #{order.orderNumber || order.id}
                </h1>
                <p className="text-xs text-[#705B54] mt-0.5">
                  Placed on {order.date}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.statusClass || 'bg-blue-100 text-blue-700'}`}>
              {order.status}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
              Payment ({order.paymentMethod}): {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Success Alert Banner if Return Submitted */}
        {returnSuccessMsg && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs text-green-800 animate-fadeIn">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>{returnSuccessMsg}</span>
            </div>
            <button onClick={() => setReturnSuccessMsg('')} className="text-green-600 hover:text-green-900 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Items & Return Action */}
          <div className="lg:col-span-8 space-y-6">

            {/* Return / Exchange Action Card for Delivered Orders */}
            {order.rawStatus === 'delivered' && (
              <div className="bg-gradient-to-r from-[#FAF5EF] to-white border-2 border-[#A87B39]/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7A0C1E]/10 text-[#7A0C1E] flex items-center justify-center shrink-0 border border-[#7A0C1E]/20 mt-0.5">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-base font-bold text-[#2B1B17]">
                      Need to Return or Exchange an Item?
                    </h3>
                    <p className="text-xs text-[#705B54] mt-0.5">
                      You can submit a hassle-free return or size exchange request for this delivered order within 5 days.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="px-4 py-2.5 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  Raise Return / Exchange Request
                </button>
              </div>
            )}

            {/* Return / Exchange Status Card if Already Submitted */}
            {order.rawStatus === 'return_requested' && (
              <div className="bg-[#FAF5EF] border border-[#E8DACD] rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3 text-[#7A0C1E]">
                  <RotateCcw className="w-5 h-5" />
                  <h3 className="font-serif-luxury text-base font-bold">
                    {order.returnType === 'exchange' ? 'Exchange Request Pending' : 'Return Request Pending'}
                  </h3>
                </div>
                <p className="text-xs text-[#705B54]">
                  You submitted a <strong>{order.returnType === 'exchange' ? 'Exchange' : 'Return'}</strong> request for this order on {order.returnRequestedAt || 'recently'}.
                </p>
                {order.returnReason && (
                  <div className="p-3 bg-white rounded-xl border border-[#E8DACD]/60 text-xs space-y-1">
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Reason Provided</span>
                    <p className="font-semibold text-[#2B1B17]">{order.returnReason}</p>
                    {order.returnNotes && (
                      <p className="text-gray-600 text-[11px] pt-1">{order.returnNotes}</p>
                    )}
                  </div>
                )}
                <p className="text-[11px] text-gray-500 italic">
                  Our customer support team is reviewing your request. We will update you via email/SMS shortly.
                </p>
              </div>
            )}

            {/* Ordered Items Table */}
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4">
              <h3 className="font-serif-luxury text-lg font-bold text-[#2B1B17] border-b border-[#E8DACD]/60 pb-3">
                Items Ordered ({order.items?.length || 0})
              </h3>
              <div className="divide-y divide-[#E8DACD]/50">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#FAF5EF] border border-[#E8DACD] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={getFormattedImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#2B1B17]">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Quantity: <strong className="text-[#2B1B17]">{item.quantity}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Price per unit: ₹{Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-[#7A0C1E]">
                        ₹{Number(item.total || (item.price * item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Address & Payment Summary */}
          <div className="lg:col-span-4 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#7A0C1E] border-b border-[#E8DACD]/60 pb-3">
                <MapPin className="w-4 h-4" />
                <h3 className="font-serif-luxury text-base font-bold text-[#2B1B17]">Shipping Address</h3>
              </div>
              {order.address ? (
                <div className="text-xs space-y-1 text-gray-600">
                  <p className="font-bold text-[#2B1B17] text-sm">{order.address.full_name || order.address.fullName}</p>
                  <p>{order.address.address_line1 || order.address.addressLine1}</p>
                  {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode || order.address.pinCode}</p>
                  <p className="pt-1 text-[#2B1B17] font-semibold">Phone: +91 {order.address.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No detailed shipping address recorded.</p>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#7A0C1E] border-b border-[#E8DACD]/60 pb-3">
                <CreditCard className="w-4 h-4" />
                <h3 className="font-serif-luxury text-base font-bold text-[#2B1B17]">Order Summary</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax:</span>
                  <span>₹{Number(order.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span>
                    {Number(order.shippingCharge) > 0
                      ? `₹${Number(order.shippingCharge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-[#7A0C1E] font-bold text-sm pt-2 border-t border-[#E8DACD]">
                  <span>Grand Total:</span>
                  <span>{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Popup for Raising Return / Exchange Request */}
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E8DACD] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-[#2B1B17] rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>

              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">
                  Request Return or Exchange
                </h3>
                <p className="text-xs text-[#705B54] mt-1">
                  Please select your preference and reason for returning or exchanging order #{order.orderNumber || order.id}.
                </p>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
                {/* Request Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-2 uppercase tracking-wider">
                    Select Request Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReturnType('return')}
                      className={`p-3 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                        returnType === 'return'
                          ? 'border-[#7A0C1E] bg-[#FAF5EF] text-[#7A0C1E]'
                          : 'border-[#E8DACD] text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      🔄 Return for Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnType('exchange')}
                      className={`p-3 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                        returnType === 'exchange'
                          ? 'border-[#7A0C1E] bg-[#FAF5EF] text-[#7A0C1E]'
                          : 'border-[#E8DACD] text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      📦 Replace / Exchange
                    </button>
                  </div>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-2 uppercase tracking-wider">
                    Reason for {returnType === 'exchange' ? 'Exchange' : 'Return'}
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl px-4 py-3 text-xs text-[#2B1B17] font-semibold focus:outline-none focus:border-[#7A0C1E]"
                  >
                    <option value="Defective or Damaged product">Defective or Damaged product</option>
                    <option value="Received wrong item or size">Received wrong item or size</option>
                    <option value="Item not as described on website">Item not as described on website</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Changed my mind / No longer needed">Changed my mind / No longer needed</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-2 uppercase tracking-wider">
                    Additional Comments / Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Provide additional details about the issue or preferred replacement..."
                    className="w-full bg-[#FAF5EF] border border-[#E8DACD] rounded-xl p-3 text-xs focus:outline-none focus:border-[#7A0C1E]"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#E8DACD]">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="flex-1 py-3 border border-[#E8DACD] text-[#2B1B17] font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="flex-1 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {submittingReturn ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
