import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/settingsStore';
import { 
  FiMail, 
  FiLock, 
  FiKey, 
  FiEye, 
  FiEyeOff, 
  FiLoader, 
  FiAlertCircle, 
  FiArrowLeft, 
  FiCheckCircle,
  FiShield,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const getLogoUrl = useSettingsStore((state) => state.getLogoUrl);
  const getSiteName = useSettingsStore((state) => state.getSiteName);
  const getTagline = useSettingsStore((state) => state.getTagline);
  const logoUrl = getLogoUrl();
  const siteName = getSiteName();
  const siteTagline = getTagline();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [emailAddress, setEmailAddress] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [simulatedOtpText, setSimulatedOtpText] = useState('');
  
  // 6-digit OTP box states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Password strength states
  const [pwdStrength, setPwdStrength] = useState({ score: 0, text: 'Too Short', colorClass: 'bg-red-400' });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    }
  });

  const watchedPassword = watch('password', '');

  // Calculate password strength
  useEffect(() => {
    if (!watchedPassword) {
      setPwdStrength({ score: 0, text: 'Empty', colorClass: 'bg-gray-200' });
      return;
    }
    let score = 0;
    if (watchedPassword.length >= 8) score++;
    if (/[A-Z]/.test(watchedPassword)) score++;
    if (/[0-9]/.test(watchedPassword)) score++;
    if (/[^A-Za-z0-9]/.test(watchedPassword)) score++;

    let text = 'Weak';
    let colorClass = 'bg-red-500';

    if (score >= 3) {
      text = 'Medium';
      colorClass = 'bg-amber-500';
    }
    if (score === 4) {
      text = 'Strong';
      colorClass = 'bg-emerald-500';
    }
    setPwdStrength({ score, text, colorClass });
  }, [watchedPassword]);

  // Handle OTP digit box changes
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    // Take last entered character if multiple typed
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    
    const joined = newDigits.join('');
    setValue('otp', joined, { shouldValidate: true });

    // Auto advance focus to next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      setValue('otp', pastedData, { shouldValidate: true });
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleSendOtp = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await ApiInstance.post('/forget-password', { email: data.email });
      if (response.data?.success) {
        setEmailAddress(data.email);
        const otpVal = response.data.data?.simulatedOtp || response.data.simulatedOtp || '';
        if (otpVal) {
          setSimulatedOtpText(otpVal);
          // Autofill OTP digits for convenient testing
          const digits = otpVal.split('');
          setOtpDigits(digits);
          setValue('otp', otpVal, { shouldValidate: true });
          toast.success(`Verification OTP generated: ${otpVal}`, { duration: 6000 });
        } else {
          toast.success('Verification code has been sent.');
        }
        setStep(2);
      } else {
        setApiError(response.data?.message || 'Error generating OTP code.');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Error requesting verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (data) => {
    const finalOtp = otpDigits.join('') || data.otp;
    if (finalOtp.length !== 6) {
      setApiError('Please enter a valid 6-digit verification code.');
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      const response = await ApiInstance.post('/verify-otp', { email: emailAddress, otp: finalOtp });
      if (response.data?.success) {
        setVerifiedOtp(finalOtp);
        toast.success('Verification code verified successfully.');
        setStep(3);
      } else {
        setApiError(response.data?.message || 'Invalid verification code.');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Verification failed. Double check your code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await ApiInstance.post('/reset-password', {
        email: emailAddress,
        otp: verifiedOtp,
        password: data.password
      });
      if (response.data?.success) {
        toast.success('Password reset successfully! You can now log in.');
        navigate('/login');
      } else {
        setApiError(response.data?.message || 'Password reset failed.');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF5EF] relative overflow-hidden font-sans">

      {/* Single Full-Screen Background Image (Full Clarity, No White Blur) */}
      <img 
        src={logoUrl} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* Main Glass Centered Card (Transparent Glassmorphism) */}
      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/80 shadow-black/10">

        <div>
          {/* Top Bar with Logo and Back Link */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A0C1E] p-0.5 shadow-md border border-[#F2E6DA] overflow-hidden shrink-0">
                <img src={logoUrl} alt="Caflore Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-wider text-[#7A0C1E] uppercase">
                  {siteName}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#A87B39] uppercase -mt-0.5">
                  {siteTagline}
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A0C1E] hover:text-[#5F0917] bg-[#7A0C1E]/10 hover:bg-[#7A0C1E]/20 px-3 py-1.5 rounded-xl transition-all"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Step Progress Pills */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#7A0C1E]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#7A0C1E]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#7A0C1E]' : 'bg-gray-200'}`} />
          </div>

          {/* API Error Box */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-600 text-xs font-medium">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* STEP 1: SEND OTP */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#2B1B17] tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-xs font-semibold text-[#705B54] mt-1 mb-6 leading-relaxed">
                Enter your registered admin email address below to receive a 6-digit verification security code.
              </p>

              <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-1.5" htmlFor="email">
                    Admin Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="text"
                      autoComplete="username"
                      placeholder="admin@caflore.com"
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border transition-all outline-none pl-10 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                          : 'border-[#E8DACD] focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30'
                      }`}
                      {...register('email', {
                        required: 'Admin email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i,
                          message: 'Invalid email format'
                        }
                      })}
                    />
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.email && (
                    <span className="text-[11px] font-medium text-red-500 mt-1 block">{errors.email.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#7A0C1E] hover:bg-[#5F0917] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#2B1B17] tracking-tight">
                Verify OTP Code
              </h1>
              <p className="text-xs font-semibold text-[#705B54] mt-1 mb-5 leading-relaxed">
                We've sent a 6-digit security code for <strong className="text-[#2B1B17]">{emailAddress}</strong>.
              </p>

              {/* Simulated OTP Alert Card */}
              {simulatedOtpText && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-[#F2E6DA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-[#7A0C1E] shrink-0" />
                    <span className="font-semibold text-[#2B1B17]">Simulated Code:</span>
                    <span className="font-mono font-black text-sm text-[#7A0C1E] bg-white px-2 py-0.5 rounded-lg border border-[#F2E6DA] tracking-widest shadow-sm">
                      {simulatedOtpText}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = simulatedOtpText.split('');
                      setOtpDigits(digits);
                      setValue('otp', simulatedOtpText, { shouldValidate: true });
                      toast.success('Code autofilled!');
                    }}
                    className="text-[11px] font-bold text-[#7A0C1E] hover:underline"
                  >
                    Autofill
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-2">
                    Enter 6-Digit Code
                  </label>
                  {/* 6 Individual Digit Box Inputs */}
                  <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 sm:w-12 h-12 text-center text-xl font-bold font-mono rounded-xl bg-white/70 border border-[#E8DACD] focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30 text-[#2B1B17] transition-all outline-none shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#7A0C1E] hover:bg-[#5F0917] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code & Continue</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#7A0C1E] hover:text-[#5F0917] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FiRefreshCw className="w-3 h-3" />
                    <span>Change Email / Resend</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#2B1B17] tracking-tight">
                New Password
              </h1>
              <p className="text-xs font-semibold text-[#705B54] mt-1 mb-6 leading-relaxed">
                Set a new, secure password for your admin account.
              </p>

              <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-1.5" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 text-[#2B1B17] text-sm border transition-all outline-none pl-10 pr-10 ${
                        errors.password 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                          : 'border-[#E8DACD] focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30'
                      }`}
                      {...register('password', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[11px] font-medium text-red-500 mt-1 block">{errors.password.message}</span>
                  )}

                  {/* Password Strength Progress */}
                  {watchedPassword && (
                    <div className="mt-2.5 bg-white/70 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center text-[11px] mb-1.5 font-bold">
                        <span className="text-gray-500">Security Rating:</span>
                        <span className={`${pwdStrength.score <= 1 ? 'text-red-500' : pwdStrength.score <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {pwdStrength.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.colorClass : 'bg-gray-200'}`} />
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.colorClass : 'bg-gray-200'}`} />
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.colorClass : 'bg-gray-200'}`} />
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.colorClass : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-[#2B1B17] mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 text-[#2B1B17] text-sm border transition-all outline-none pl-10 pr-10 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                          : 'border-[#E8DACD] focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30'
                      }`}
                      {...register('confirmPassword', {
                        required: 'Confirm password is required',
                        validate: value => value === watchedPassword || 'Passwords do not match'
                      })}
                    />
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[11px] font-medium text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#7A0C1E] hover:bg-[#5F0917] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Reset Password & Finish</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;