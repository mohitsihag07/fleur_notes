'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar, Globe, Sparkles, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function EditProfilePage() {
  const router = useRouter();
  
  // Mock initial state representing user data
  const [formData, setFormData] = useState({
    fullName: 'Ananya Verma',
    email: 'ananya.verma@email.com',
    phone: '+91 98765 43210',
    dob: '1996-03-15',
    gender: 'Female',
    language: 'English (IN)'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call saving changes
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

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-[#E8DACD] p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
              <span>ACCOUNT SETTINGS</span>
            </div>
            <h1 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">
              Edit Profile
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Update your personal details to personalize your Fleur Notes experience.
            </p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#E8DACD]/60">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#E8DACD] bg-[#FAF5EF]">
              <Image
                src="/images/categories/home_decor.jpg"
                alt="Profile Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#2B1B17]">Profile Image</span>
              <p className="text-[10px] text-gray-400 mt-0.5 mb-2.5">JPG or PNG. Max size 2MB.</p>
              <div className="flex gap-2">
                <button type="button" className="py-1.5 px-3 border border-[#E8DACD] rounded-lg text-[10px] font-bold text-[#2B1B17] hover:bg-[#F2E6DA] transition-all">
                  Change Photo
                </button>
                <button type="button" className="py-1.5 px-3 text-red-500 hover:text-red-700 text-[10px] font-bold transition-all">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Full Name</label>
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

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ananya.verma@email.com"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-1 block">Email address cannot be modified.</span>
              </div>

              {/* Phone Number */}
              <div>
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

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Default Language */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Default Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="English (IN)">English (IN)</option>
                    <option value="English (US)">English (US)</option>
                    <option value="Hindi (HN)">Hindi (HN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Profile updated successfully! Redirecting...</span>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
