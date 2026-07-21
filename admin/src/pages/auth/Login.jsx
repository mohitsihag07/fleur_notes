import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FiEye, FiEyeOff, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('fleur_remember_email') || '',
      password: '',
      rememberMe: !!localStorage.getItem('fleur_remember_email'),
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success(result.message || 'Welcome back!');
        if (data.rememberMe) {
          localStorage.setItem('fleur_remember_email', data.email);
        } else {
          localStorage.removeItem('fleur_remember_email');
        }
        navigate('/dashboard');
      } else {
        setApiError(result.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setApiError('An unexpected network error occurred.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF5F5] via-[#FFF0EC] to-[#F7FCF9] relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#FF9D9D_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF9D9D]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC5AA]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Outer Card */}
      <div className="relative w-full max-w-5xl bg-white/60 backdrop-blur-2xl rounded-3xl p-3 sm:p-5 shadow-2xl border border-white/80 shadow-rose-900/10 flex flex-col lg:flex-row items-stretch gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Login Form */}
        <div className="w-full lg:w-1/2 bg-white/90 backdrop-blur-md rounded-2xl p-7 sm:p-9 flex flex-col justify-between shadow-sm border border-gray-100">
          
          <div>
            {/* Top Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9D9D] to-[#FFC5AA] text-[#2D252E] flex items-center justify-center font-black text-sm shadow-md">
                FN
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 font-sans">
                Fleur Notes
              </span>
            </div>

            {/* Header Titles */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Hi Admin!
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-1 mb-6">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border transition-all outline-none ${
                    errors.email 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                      : 'border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 text-gray-900 text-sm border transition-all outline-none ${
                      errors.password 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                        : 'border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between py-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#FF9D9D] focus:ring-[#FF9D9D] accent-[#FF9D9D]"
                    {...register('rememberMe')}
                  />
                  <span className="font-semibold text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-bold text-[#F57070] hover:underline"
                >
                  Forgot my password
                </Link>
              </div>

              {/* Primary Log in Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#FF9D9D] hover:bg-[#F58383] active:scale-[0.99] text-[#2D252E] font-extrabold text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
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

        {/* RIGHT PANEL: 3D Security Shield Visual Artwork */}
        <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#FFF5F5] to-[#FFEBE3] rounded-2xl p-8 items-center justify-center overflow-hidden border border-white/60">
          
          {/* Isometric Tile Floor */}
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />

          {/* Glowing Backdrops */}
          <div className="absolute w-72 h-72 bg-[#FF9D9D]/30 rounded-full blur-3xl -top-10 -right-10" />
          <div className="absolute w-60 h-60 bg-[#FFC5AA]/30 rounded-full blur-3xl bottom-0 left-0" />

          {/* 3D Glass Shield Container */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Curved Animated Ring */}
            <div className="absolute w-72 h-72 rounded-full border-4 border-[#FF9D9D]/40 border-t-[#FF9D9D] animate-spin [animation-duration:12s] pointer-events-none" />

            {/* 3D Glass Badge Shield */}
            <div className="relative w-48 h-56 bg-white/40 backdrop-blur-xl rounded-3xl border-2 border-white/80 shadow-2xl flex flex-col items-center justify-center p-6 transform hover:rotate-2 transition-transform duration-500">
              
              {/* User Avatar Icon inside Shield */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF9D9D] to-[#FFC5AA] flex items-center justify-center text-[#2D252E] shadow-xl shadow-rose-500/30 mb-4 animate-bounce [animation-duration:3s]">
                <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>

              {/* Password Asterisk Pill Badge */}
              <div className="bg-white rounded-2xl px-5 py-2 shadow-xl border border-gray-100 flex items-center gap-2">
                <span className="text-xl font-black text-[#2D252E] tracking-widest">* * *</span>
              </div>
            </div>

            {/* Wooden Pedestal Base Visual */}
            <div className="w-56 h-8 bg-gradient-to-r from-[#FFC5AA]/60 via-[#FF9D9D]/60 to-[#FFC5AA]/60 backdrop-blur-md rounded-2xl mt-4 shadow-lg border border-amber-500/20 transform rotate-1" />

            {/* Play overlay button */}
            <div className="absolute w-14 h-14 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center text-[#2D252E] cursor-pointer hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-[#2D252E] ml-1" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;