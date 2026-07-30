'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Truck, Award, Loader2, Phone, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp } = useAuth();
  const { logoUrl, siteName } = useSettings();

  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'email'

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [demoOtp, setDemoOtp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/profile');
      } else {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(phone, 'login');
      if (res.success) {
        setOtpStep(2);
        if (res.otp) setDemoOtp(res.otp);
        setSuccessMessage(res.message || 'OTP sent successfully!');
      } else {
        setErrorMessage(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMessage('An error occurred sending OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(phone, otp, name);
      if (res.success) {
        router.push('/profile');
      } else {
        setErrorMessage(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full bg-[#F2E6DA] rounded-3xl border border-[#E8DACD] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* Left Story Background Panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between relative min-h-[500px]">
          <div className="space-y-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/90 p-1.5 shadow-xs border border-[#E8DACD] overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img src={logoUrl} alt={siteName || "Logo"} className="w-full h-full object-contain" />
              </div>
              <span className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">
                {siteName || 'Caflore'}
              </span>
            </Link>

            <div className="space-y-2 pt-4">
              <h2 className="font-serif-luxury text-4xl font-bold text-[#2B1B17]">
                Welcome Back 🌿
              </h2>
              <p className="text-xs text-[#705B54] leading-relaxed max-w-xs">
                Sign in with Mobile OTP or Email to access your saved items and orders.
              </p>
            </div>
          </div>

          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/hero_banner.jpg"
              alt="Caflore Login"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F2E6DA] via-[#F2E6DA]/40 to-transparent" />
          </div>

          {/* Bottom Floating Trust Badges Card */}
          <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#E8DACD] grid grid-cols-3 gap-2 text-center mt-auto">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-[#7A0C1E] mb-1" />
              <span className="text-[10px] font-bold text-[#2B1B17]">Secure Login</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-[#7A0C1E] mb-1" />
              <span className="text-[10px] font-bold text-[#2B1B17]">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-4 h-4 text-[#7A0C1E] mb-1" />
              <span className="text-[10px] font-bold text-[#2B1B17]">Premium Quality</span>
            </div>
          </div>
        </div>

        {/* Right Sign In Form Card */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-12 flex flex-col justify-between">
          <div className="text-right text-xs text-gray-500 mb-6">
            <span>New here? </span>
            <Link href="/auth/register" className="font-bold text-[#7A0C1E] hover:underline">
              Create an account
            </Link>
          </div>

          <div className="max-w-sm mx-auto w-full space-y-6 my-auto">
            <div>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">Sign In</h2>
              <p className="text-xs text-gray-500 mt-1">Choose your preferred login method</p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#FAF5EF] rounded-xl border border-[#E8DACD] text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode('otp'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'otp' ? 'bg-[#7A0C1E] text-white shadow-xs' : 'text-gray-600 hover:text-[#2B1B17]'
                }`}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'email' ? 'bg-[#7A0C1E] text-white shadow-xs' : 'text-gray-600 hover:text-[#2B1B17]'
                }`}
              >
                Email & Password
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                {successMessage}
                {demoOtp && <span className="block font-mono mt-1 font-bold">Demo OTP Code: {demoOtp}</span>}
              </div>
            )}

            {authMode === 'otp' ? (
              otpStep === 1 ? (
                /* Step 1: Send Phone OTP */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Mobile Phone Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-xs text-gray-500 border-r border-gray-200 pr-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-24 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Get OTP Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify Phone OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Enter 6-Digit OTP</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold tracking-widest rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B1B17] mb-1">Full Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Sign In</span>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="text-[#7A0C1E] font-semibold hover:underline"
                    >
                      Change Phone Number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-gray-500 hover:text-[#2B1B17]"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Email / Password Form */
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2B1B17] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#2B1B17]">Password</label>
                    <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-[#7A0C1E] hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
