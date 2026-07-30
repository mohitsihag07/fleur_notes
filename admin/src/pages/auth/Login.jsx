import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import { FiEye, FiEyeOff, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const getLogoUrl = useSettingsStore((state) => state.getLogoUrl);
  const getSiteName = useSettingsStore((state) => state.getSiteName);
  const getTagline = useSettingsStore((state) => state.getTagline);
  const logoUrl = getLogoUrl();
  const siteName = getSiteName();
  const siteTagline = getTagline();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('caflore_remember_email') || '',
      password: '',
      rememberMe: !!localStorage.getItem('caflore_remember_email'),
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const result = await login(data.email, data.password);
      if (result?.success) {
        toast.success(result.message || 'Welcome back!');
        if (data.rememberMe) {
          localStorage.setItem('caflore_remember_email', data.email);
        } else {
          localStorage.removeItem('caflore_remember_email');
        }
        navigate('/dashboard');
      } else {
        const errorMsg = result?.message || 'Login failed. Please verify credentials.';
        toast.error(errorMsg);
        setApiError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An unexpected network error occurred.';
      toast.error(errorMsg);
      setApiError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF5EF] relative overflow-hidden font-sans">

      {/* Single Full-Screen Background Image (Full Clarity, No White Blur / No Faded Haze) */}
      <img 
        src={logoUrl} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* Main Glass Centered Login Card (Transparent Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/80 shadow-black/10">

        <div>
          {/* Top Logo */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#7A0C1E] p-0.5 shadow-md border border-[#F2E6DA] overflow-hidden shrink-0">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-2xl tracking-wider text-[#7A0C1E] uppercase">
                {siteName}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#A87B39] uppercase -mt-0.5">
                {siteTagline}
              </span>
            </div>
          </div>

          {/* Header Titles */}
          <h1 className="text-3xl font-extrabold text-[#2B1B17] tracking-tight">
            Hi Admin!
          </h1>
          <p className="text-xs font-semibold text-[#705B54] mt-1 mb-6">
            Welcome back! Enter your details to sign in.
          </p>

          {/* API Error Box */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-600 text-xs font-medium">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B17] mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-xl bg-white/60 focus:bg-white/90 text-[#2B1B17] text-sm border transition-all outline-none ${
                  errors.email 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                    : 'border-white/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/20'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <span className="text-[11px] font-medium text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B17] mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-xl bg-white/60 focus:bg-white/90 text-[#2B1B17] text-sm border transition-all outline-none pr-10 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                      : 'border-white/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/20'
                  }`}
                  {...register('password', {
                    required: 'Password is required'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7A0C1E] transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] font-medium text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#E8DACD] text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                  {...register('rememberMe')}
                />
                <span className="text-xs font-medium text-[#705B54]">Remember email</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#7A0C1E] hover:text-[#5F0917] hover:underline"
              >
                Forgot my password
              </Link>
            </div>

            {/* Primary Log in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7A0C1E] to-[#5F0917] hover:from-[#8F1025] hover:to-[#7A0C1E] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-[#7A0C1E]/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 border border-[#7A0C1E]"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Login;