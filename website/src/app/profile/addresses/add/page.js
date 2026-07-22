'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Phone, Building, Tag, Sparkles, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function AddAddressPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressType: 'Home', // Home, Office, Other
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    isDefault: false
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, addressType: type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate saving address details via API call
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container className="max-w-2xl">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A0C1E] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        {/* Address Card Container */}
        <div className="bg-white rounded-3xl border border-[#E8DACD] p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>SAVED ADDRESSES</span>
            </div>
            <h1 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">
              Add Shipping Address
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Provide a shipping address to facilitate smoother checkout flows.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Type Selection */}
            <div>
              <label className="block text-xs font-medium text-[#2B1B17] mb-2.5">Address Type</label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      formData.addressType === type
                        ? 'bg-[#7A0C1E] text-white border-[#7A0C1E]'
                        : 'bg-white text-[#2B1B17] border-[#E8DACD] hover:bg-[#FAF5EF]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Receiver Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Full Name (Receiver)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Ananya Verma"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Street Address</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    required
                    placeholder="Flat 402, Lotus Apartments, Lane 5"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Landmark (Optional)</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near Koregaon Park Garden"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* Town/City */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Town / City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Pune"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                />
              </div>

              {/* Pin Code */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  required
                  placeholder="411001"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="India"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            {/* Set as default checkbox */}
            <div className="flex items-center gap-2 pt-2 text-xs">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="rounded text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E] w-4.5 h-4.5 cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-gray-600 cursor-pointer">
                Set as default shipping address
              </label>
            </div>

            {/* Success message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Address added successfully! Redirecting...</span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DACD]/60">
              <Link
                href="/profile"
                className="py-3 px-6 border border-[#E8DACD] hover:bg-[#F2E6DA] text-[#2B1B17] text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || success}
                className="py-3 px-6 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
