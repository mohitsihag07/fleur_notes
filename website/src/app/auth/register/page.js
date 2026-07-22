'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gift, Truck, ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { ValueProps } from '@/components/home/ValueProps';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="min-h-screen bg-[#FAF5EF] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full bg-white rounded-3xl border border-[#E8DACD] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* Left Info Panel */}
        <div className="lg:col-span-5 bg-[#F2E6DA] p-8 sm:p-12 flex flex-col justify-between border-r border-[#E8DACD]">
          <div className="space-y-6">
            <div>
              <Link href="/" className="font-serif-luxury text-3xl font-bold text-[#7A0C1E]">
                Fleur Notes
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
                  <h4 className="text-xs font-semibold text-[#2B1B17]">Exclusive Rewards</h4>
                  <p className="text-[11px] text-[#705B54]">Earn points and get special discounts on your favorite products.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#2B1B17]">Fast & Free Shipping</h4>
                  <p className="text-[11px] text-[#705B54]">Free shipping on orders over ₹1,500 and fast delivery at your doorstep.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-white text-[#7A0C1E] border border-[#E8DACD] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#2B1B17]">Secure Shopping</h4>
                  <p className="text-[11px] text-[#705B54]">Your information is 100% safe and secured with us.</p>
                </div>
              </div>
            </div>

            {/* Bottom photography */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mt-6 border border-[#E8DACD]">
              <Image
                src="/images/banners/hero_banner.jpg"
                alt="Fleur Notes Signup"
                fill
                className="object-cover"
              />
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

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">Sign Up</h2>
              <p className="text-xs text-gray-500 mt-1">Fill in the details below to create your account</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1">Phone Number (Optional)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-xs text-gray-500 border-r border-gray-200 pr-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full pl-24 pr-4 py-2.5 text-xs rounded-xl border border-[#E8DACD] outline-none focus:border-[#7A0C1E] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1">Password</label>
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
                {/* Password Strength Checks */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {passwordChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Check className={`w-3 h-3 ${check.valid ? 'text-green-600' : 'text-gray-300'}`} />
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-[#2B1B17] mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
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

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  required
                  className="rounded text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                />
                <span className="text-gray-600">
                  I agree to the <Link href="/terms" className="text-[#7A0C1E] font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-[#7A0C1E] font-semibold hover:underline">Privacy Policy</Link>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Create Account
              </button>

              {/* Social Login Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#E8DACD] w-full" />
                <span className="bg-white px-3 text-[11px] text-gray-400 absolute">or sign up with</span>
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
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full pt-8">
        <ValueProps />
      </div>
    </div>
  );
}
