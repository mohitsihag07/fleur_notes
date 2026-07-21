import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import ApiInstance from '../../utils/ApiInstance';
import { 
  FiMail, 
  FiLock, 
  FiKey, 
  FiEye, 
  FiEyeOff, 
  FiLoader, 
  FiAlertCircle, 
  FiArrowLeft, 
  FiCheckCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [emailAddress, setEmailAddress] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [simulatedOtpText, setSimulatedOtpText] = useState('');

  // Password strength states
  const [pwdStrength, setPwdStrength] = useState({ score: 0, text: 'Too Short', colorClass: 'strength-bar-weak' });

  const {
    register,
    handleSubmit,
    watch,
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
  React.useEffect(() => {
    if (!watchedPassword) {
      setPwdStrength({ score: 0, text: 'Empty', colorClass: '' });
      return;
    }
    let score = 0;
    if (watchedPassword.length >= 8) score++;
    if (/[A-Z]/.test(watchedPassword)) score++;
    if (/[0-9]/.test(watchedPassword)) score++;
    if (/[^A-Za-z0-9]/.test(watchedPassword)) score++;

    let text = 'Weak';
    let colorClass = 'strength-bar-weak animate-pulse';

    if (score >= 3) {
      text = 'Medium';
      colorClass = 'strength-bar-medium';
    }
    if (score === 4) {
      text = 'Strong';
      colorClass = 'strength-bar-strong';
    }
    setPwdStrength({ score, text, colorClass });
  }, [watchedPassword]);

  // Step 1: Request OTP
  const handleSendOtp = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await ApiInstance.post('/forget-password', { email: data.email });
      if (response.data.success) {
        setEmailAddress(data.email);
        const otpVal = response.data.data?.simulatedOtp || '';
        if (otpVal) {
          setSimulatedOtpText(otpVal);
          toast.success(`OTP Simulated: ${otpVal}`, { duration: 6000 });
        } else {
          toast.success('Reset code has been sent.');
        }
        setStep(2);
      } else {
        setApiError(response.data.message || 'Error simulating OTP.');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Error requesting verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await ApiInstance.post('/verify-otp', { email: emailAddress, otp: data.otp });
      if (response.data.success) {
        setVerifiedOtp(data.otp);
        toast.success('Verification code verified successfully.');
        setStep(3);
      } else {
        setApiError(response.data.message || 'Invalid code.');
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
      if (response.data.success) {
        toast.success('Password reset successfully. You can now login.');
        navigate('/login');
      } else {
        setApiError(response.data.message || 'Password reset failed.');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page justify-center items-center p-6 transition-theme">
      {/* Glow Spheres */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className="glass-card">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-app-text-muted hover:text-cherry-light transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-app-text font-sans">Forgot Password</h2>
              <p className="text-xs text-app-text-muted mt-1.5 leading-relaxed">
                Enter your registered admin email address, and we will send you a verification code (OTP).
              </p>
            </div>

            {apiError && (
              <div className="mb-5 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-2.5 text-[#ef4444] text-xs">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
              <div className="form-group">
                <label className="block text-xs font-semibold text-app-text mb-1.5" htmlFor="email">
                  Admin Email
                </label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@fleur.com"
                    className={`form-input input-with-icon ${errors.email ? 'border-[#ef4444] focus:border-[#ef4444]' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-[#ef4444] mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </span>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-app-text">Verify Code</h2>
              <p className="text-xs text-app-text-muted mt-1.5 leading-relaxed">
                We've simulated a verification code for <strong className="text-app-text">{emailAddress}</strong>. 
                Enter the 6-digit code below.
              </p>
            </div>

            {/* Simulated OTP notice */}
            {simulatedOtpText && (
              <div className="mb-5 p-3 rounded-lg bg-gradient-to-r from-cherry-light/10 to-cherry-dark/10 border border-cherry-light/20 flex items-start gap-2.5 text-app-text text-xs">
                <FiCheckCircle className="w-4 h-4 text-cherry-light flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cherry-light">Simulated Code: </span>
                  <span className="font-mono tracking-wider font-bold bg-app-bg px-2 py-0.5 rounded border border-app-border">
                    {simulatedOtpText}
                  </span>
                </div>
              </div>
            )}

            {apiError && (
              <div className="mb-5 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-2.5 text-[#ef4444] text-xs">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
              <div className="form-group">
                <label className="block text-xs font-semibold text-app-text mb-1.5" htmlFor="otp">
                  Verification Code (OTP)
                </label>
                <div className="input-icon-wrapper">
                  <FiKey className="input-icon" />
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className={`form-input input-with-icon font-mono tracking-widest text-center text-lg ${errors.otp ? 'border-[#ef4444] focus:border-[#ef4444]' : ''}`}
                    {...register('otp', {
                      required: 'Verification code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be exactly 6 digits'
                      }
                    })}
                  />
                </div>
                {errors.otp && (
                  <span className="text-[11px] text-[#ef4444] mt-1 block">
                    {errors.otp.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-medium text-app-text-muted hover:text-app-text mt-3 transition-colors block cursor-pointer"
              >
                Resend Code
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-app-text">Reset Password</h2>
              <p className="text-xs text-app-text-muted mt-1.5 leading-relaxed">
                Choose a strong new login password for your account.
              </p>
            </div>

            {apiError && (
              <div className="mb-5 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-start gap-2.5 text-[#ef4444] text-xs">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
              {/* New Password */}
              <div className="form-group">
                <label className="block text-xs font-semibold text-app-text mb-1.5" htmlFor="password">
                  New Password
                </label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-input input-with-icon ${errors.password ? 'border-[#ef4444] focus:border-[#ef4444]' : ''}`}
                    {...register('password', {
                      required: 'New Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-end focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] text-[#ef4444] mt-1 block">
                    {errors.password.message}
                  </span>
                )}

                {/* Password Strength Indicators */}
                {watchedPassword && (
                  <div className="mt-2.5">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-app-text-muted font-medium">Strength:</span>
                      <span className={`font-semibold ${pwdStrength.score <= 1 ? 'text-[#ef4444]' : pwdStrength.score <= 3 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                        {pwdStrength.text}
                      </span>
                    </div>
                    <div className="strength-bar-container">
                      <div className={`strength-bar-segment ${pwdStrength.score >= 1 ? pwdStrength.colorClass : ''}`}></div>
                      <div className={`strength-bar-segment ${pwdStrength.score >= 2 ? pwdStrength.colorClass : ''}`}></div>
                      <div className={`strength-bar-segment ${pwdStrength.score >= 3 ? pwdStrength.colorClass : ''}`}></div>
                      <div className={`strength-bar-segment ${pwdStrength.score >= 4 ? pwdStrength.colorClass : ''}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="block text-xs font-semibold text-app-text mb-1.5" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-input input-with-icon ${errors.confirmPassword ? 'border-[#ef4444] focus:border-[#ef4444]' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: value => value === watchedPassword || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="input-icon-end focus:outline-none"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-[#ef4444] mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </span>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;