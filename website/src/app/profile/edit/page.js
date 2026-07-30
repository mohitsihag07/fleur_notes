'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar, Sparkles, Check, MapPin, Loader2, Camera } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/context/AuthContext';
import { getBackendURL } from '@/services/api';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone ? `+91 ${user.phone}` : '');
      setDob(user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
      setGender(user.gender || '');
      setAddress(user.address || user.default_address || '');
      setProfilePicture(user.profile_picture || '');
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfilePicture(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const savedToken = localStorage.getItem('user_token');
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const res = await fetch(`${backendUrl}/api/users/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          name: fullName,
          gender: gender,
          date_of_birth: dob,
          address: address,
          profile_picture: profilePicture
        })
      });

      const data = await res.json();
      if (data?.success && data?.data?.user) {
        const updatedUser = { ...user, ...data.data.user };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1200);
      } else {
        setError(data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('An error occurred while saving changes.');
    } finally {
      setSaving(false);
    }
  };

  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('user_token'));

  if (authLoading || (hasToken && !isLoggedIn)) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="flex items-center gap-3 font-semibold text-[#7A0C1E] text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading profile editor...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DACD] p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#7A0C1E]/10 text-[#7A0C1E] flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Sign In Required</h2>
          <p className="text-xs text-[#705B54]">Please sign in to edit your account profile details.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5F0917] transition-all">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

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
              Update your personal details below. Phone number and email cannot be changed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload Section */}
            <div className="flex items-center gap-5 pb-6 border-b border-[#E8DACD]/60">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#E8DACD] bg-[#7A0C1E] text-white flex items-center justify-center font-serif-luxury text-3xl font-bold shrink-0 shadow-sm">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(fullName || 'User').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="block text-xs font-bold text-[#2B1B17]">Profile Picture</span>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-2.5">Upload JPG or PNG image (Max 5MB)</p>
                <div className="flex gap-2">
                  <label className="py-1.5 px-3 border border-[#E8DACD] rounded-xl text-xs font-bold text-[#7A0C1E] bg-[#FAF5EF] hover:bg-[#F2E6DA] transition-all cursor-pointer inline-flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={() => setProfilePicture('')}
                      className="py-1.5 px-3 text-red-600 hover:text-red-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email || 'Not provided'}
                    disabled
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number (Read Only)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone || 'Not provided'}
                    disabled
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
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
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Default Shipping Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#2B1B17] mb-1.5">Default Shipping Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your default shipping address"
                    className="w-full pl-10 pr-4 py-3 text-[#2B1B17] text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

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
                className="py-3 px-6 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
