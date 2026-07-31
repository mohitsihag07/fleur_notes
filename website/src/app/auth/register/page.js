'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gift,
  Truck,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Loader2,
  KeyRound,
  Camera,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function RegisterPage() {
  const router = useRouter();
  const { registerSendOtp, verifyEmailOtp } = useAuth();
  const { logoUrl, siteName } = useSettings();

  const [step, setStep] = useState(1); // 1: Details Form, 2: OTP Verification

  // Form Fields
  const [profilePicture, setProfilePicture] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Image Upload Handler with Canvas Compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = typeof window !== 'undefined' ? new window.Image() : null;
      if (!img) return;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setProfilePicture(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Step 1: Registration Form Submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) return setErrorMessage('Full Name is required.');
    if (!email.trim()) return setErrorMessage('Email Address is required.');
    if (!phone.trim() || phone.trim().length < 10) return setErrorMessage('Please enter a valid 10-digit phone number.');
    if (!password) return setErrorMessage('Password is required.');
    if (password !== confirmPassword) return setErrorMessage('Passwords do not match.');

    setIsSubmitting(true);
    try {
      const res = await registerSendOtp({
        name,
        email,
        phone,
        date_of_birth: dateOfBirth,
        gender,
        profile_picture: profilePicture,
        password
      });

      if (res.success) {
        setDemoOtp(res.data?.otp || '123456');
        setSuccessMessage(`OTP verification code sent to ${email}`);
        setStep(2);
      } else {
        setErrorMessage(res.message || 'Failed to process registration.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Email OTP Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyEmailOtp(email, otp);
      if (res.success) {
        router.push('/profile');
      } else {
        setErrorMessage(res.message || 'Invalid OTP code entered.');
      }
    } catch (err) {
      setErrorMessage('OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="min-h-screen bg-[#FAF5EF] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full bg-white rounded-3xl border border-[#E8DACD] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* Left Branding & Highlights Column */}
        <div className="lg:col-span-5 bg-[#F2E6DA] p-8 sm:p-12 flex flex-col justify-between border-r border-[#E8DACD]">
          <div className="space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/90 p-1.5 shadow-xs border border-[#E8DACD] overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <img src={logoUrl} alt={siteName || "Logo"} className="w-full h-full object-contain" />
                </div>
                <span className="font-serif-luxury text-3xl font-bold text-[#7A0C1E]">
                  {siteName || 'Fleur Notes'}
                </span>
              </Link>
              <p className="text-xs text-gray-500 mt-1">Crafted with love, made for you.</p>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">
                Create Your Account
              </h2>
              <p className="text-xs text-[#705B54] leading-relaxed">
                Join Fleur Notes and explore handmade treasures made just for you.
              </p>
            </div>

            <div className="space-y-5 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2B1B17]">Welcome Rewards</h4>
                  <p className="text-[11px] text-[#705B54]">Get exclusive discounts on your first order.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2B1B17]">Express Delivery</h4>
                  <p className="text-[11px] text-[#705B54]">Track your orders in real time.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2B1B17]">Verified Account Badge</h4>
                  <p className="text-[11px] text-[#705B54]">Complete email OTP verification to get your Verified badge.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8DACD] mt-6 flex items-center justify-between text-xs">
            <span className="text-gray-500">Already have an account?</span>
            <Link href="/auth/login" className="font-bold text-[#7A0C1E] hover:underline flex items-center gap-1">
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Dynamic Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#7A0C1E] uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 fill-[#7A0C1E]" />
                <span>{step === 1 ? 'Step 1 of 2: Profile Setup' : 'Step 2 of 2: OTP Verification'}</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1B17]">
                {step === 1 ? 'Sign Up' : 'Verify Email OTP'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {step === 1
                  ? 'Fill in your details below to create your account'
                  : `Enter the 6-digit verification code sent to ${email}`}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold space-y-1">
                <p>{successMessage}</p>
                {demoOtp && (
                  <p className="font-mono text-[11px] font-bold text-[#7A0C1E]">
                    Demo OTP Code: <span className="underline">{demoOtp}</span>
                  </p>
                )}
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: SINGLE ALL-IN-ONE REGISTRATION FORM */
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                {/* Profile Picture Upload Avatar */}
                <div className="flex flex-col items-center justify-center pb-2">
                  <div className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-[#FAF5EF] border-2 border-[#7A0C1E]/40 overflow-hidden flex items-center justify-center shadow-sm">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-[#705B54]" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#7A0C1E] text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                      title="Upload Profile Picture"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <span className="text-[11px] text-[#705B54] font-medium mt-1">Upload Profile Picture (Optional)</span>
                </div>

                {/* Full Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mohit Sihag"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mohit@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Number & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Phone Number *</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1 text-xs text-gray-500 border-r border-gray-200 pr-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full pl-24 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-[#2B1B17] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs pt-1">
                  <input
                    type="checkbox"
                    required
                    className="rounded text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                  />
                  <span className="text-gray-600">
                    I agree to the <Link href="/terms" className="text-[#7A0C1E] font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-[#7A0C1E] font-semibold hover:underline">Privacy Policy</Link>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Email OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Email Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: EMAIL OTP VERIFICATION FORM */
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="bg-[#F2E6DA] rounded-2xl border border-[#E8DACD] p-4 text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-[#2B1B17]">Verification Code Sent</p>
                  <p className="text-xs text-[#705B54] font-medium">{email}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B1B17] mb-1">Enter 6-Digit Email OTP</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold tracking-widest rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Get Verified Badge</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#7A0C1E] font-semibold hover:underline"
                  >
                    ← Edit Registration Details
                  </button>
                  <button
                    type="button"
                    onClick={handleDetailsSubmit}
                    className="text-gray-500 hover:text-[#2B1B17]"
                  >
                    Resend Email OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
