'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Truck, Award } from 'lucide-react';
import { ValueProps } from '@/components/home/ValueProps';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[#FAF5EF] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full bg-[#F2E6DA] rounded-3xl border border-[#E8DACD] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* Left Story Background Panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between relative min-h-[500px]">
          <div className="space-y-6 relative z-10">
            <Link href="/" className="font-serif-luxury text-3xl font-bold text-[#2B1B17] block">
              Fleur Notes
            </Link>

            <div className="space-y-2 pt-4">
              <h2 className="font-serif-luxury text-4xl font-bold text-[#2B1B17]">
                Welcome Back 🌿
              </h2>
              <p className="text-xs text-[#705B54] leading-relaxed max-w-xs">
                Sign in to continue shopping your favorite handmade products.
              </p>
            </div>
          </div>

          {/* Photography Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/hero_banner.jpg"
              alt="Fleur Notes Login"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F2E6DA] via-[#F2E6DA]/40 to-transparent" />
          </div>

          {/* Bottom Floating Trust Badges Card */}
          <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#E8DACD] grid grid-cols-3 gap-2 text-center mt-auto">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-[#7A0C1E] mb-1" />
              <span className="text-[10px] font-bold text-[#2B1B17]">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-[#7A0C1E] mb-1" />
              <span className="text-[10px] font-bold text-[#2B1B17]">Fast & Free Shipping</span>
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
              <p className="text-xs text-gray-500 mt-1">Enter your details to access your account</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Email Address */}
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

              {/* Password */}
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

              {/* Remember me */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="rounded text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                />
                <span className="text-gray-600 font-medium">Remember me</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Sign In
              </button>

              {/* Social Login Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#E8DACD] w-full" />
                <span className="bg-white px-3 text-[11px] text-gray-400 absolute">or continue with</span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-[#E8DACD] rounded-xl text-xs font-medium text-[#2B1B17] hover:bg-gray-50">
                  <span>Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-[#E8DACD] rounded-xl text-xs font-medium text-[#2B1B17] hover:bg-gray-50">
                  <span>Facebook</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-[#E8DACD] rounded-xl text-xs font-medium text-[#2B1B17] hover:bg-gray-50">
                  <span>Apple</span>
                </button>
              </div>
            </form>

            <p className="text-[10px] text-center text-gray-400 pt-2">
              By signing in, you agree to our <Link href="/terms" className="text-[#7A0C1E] underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-[#7A0C1E] underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full pt-8">
        <ValueProps />
      </div>
    </div>
  );
}
