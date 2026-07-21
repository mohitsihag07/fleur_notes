import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ApiInstance from '../../utils/ApiInstance';
import useAuthStore from '../../store/authStore';
import { 
  FiUser, 
  FiLock, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiGlobe, 
  FiSave, 
  FiLoader,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Password fields visibility
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Forms
  const profileForm = useForm();
  const passwordForm = useForm();

  // Watch new password for confirm matching
  const newPasswordVal = passwordForm.watch('newPassword', '');

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiInstance.get('/profile');
        if (response.data?.success) {
          const { user: apiUser, profile, address } = response.data.data;
          
          if (profile?.profile_picture) {
            setAvatarPreview(profile.profile_picture);
          }

          // Prefill profile form fields
          profileForm.reset({
            name: apiUser.name || '',
            email: apiUser.email || '',
            phone: apiUser.phone || '',
            gender: profile?.gender || '',
            dob: profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
            bio: profile?.bio || '',
            address: address?.address_line1 || '',
            city: address?.city || '',
            state: address?.state || '',
            country: address?.country || 'India',
            postal_code: address?.pincode || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile details.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [profileForm]);

  // Handle Profile Avatar Image Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    setUploadingAvatar(true);
    try {
      const res = await ApiInstance.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        const uploadedUrl = res.data.data.url;
        setAvatarPreview(uploadedUrl);
        toast.success('Profile picture uploaded & saved successfully');
        
        // Immediately sync with global user store
        if (setUser && user) {
          setUser({
            ...user,
            profile_picture: uploadedUrl
          });
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile information
  const onProfileSubmit = async (data) => {
    setSaveLoading(true);
    try {
      const payload = {
        ...data,
        profile_picture: avatarPreview
      };

      const response = await ApiInstance.put('/profile', payload);
      if (response.data?.success) {
        toast.success(response.data.message || 'Profile updated successfully.');
        
        // Update local authStore user to sync navbar
        const updatedUser = response.data.data.user;
        setUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          profile_picture: avatarPreview
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Change Password
  const onPasswordSubmit = async (data) => {
    setPwdLoading(true);
    try {
      const response = await ApiInstance.put('/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (response.data?.success) {
        toast.success(response.data.message || 'Password changed successfully!');
        passwordForm.reset();
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Incorrect current password or update failed.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="w-8 h-8 text-[#FF9D9D] animate-spin" />
          <span className="text-xs font-bold text-gray-400">Loading profile details...</span>
        </div>
      </div>
    );
  }

  const currentUserName = profileForm.watch('name') || user?.name || 'Fleur Admin';
  const currentUserEmail = profileForm.watch('email') || user?.email || 'admin@fleur.com';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Upload Container */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF9D9D] to-[#FFC5AA] text-[#2D252E] flex items-center justify-center text-3xl font-black shadow-md ring-4 ring-[#FF9D9D]/30 overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview.startsWith('http') ? avatarPreview : `http://localhost:3131${avatarPreview.startsWith('/') ? '' : '/'}${avatarPreview}`}
                alt={currentUserName}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            )}
          </div>

          <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-gray-200 text-gray-700 shadow-md cursor-pointer hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all">
            {uploadingAvatar ? (
              <FiLoader className="w-4 h-4 animate-spin text-[#FF9D9D]" />
            ) : (
              <FiCamera className="w-4 h-4" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
            />
          </label>
        </div>

        {/* Info Header */}
        <div className="text-center md:text-left space-y-1.5 flex-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{currentUserName}</h1>
          <p className="text-xs font-semibold text-gray-500 flex items-center justify-center md:justify-start gap-1.5">
            <FiMail className="w-4 h-4 text-[#FF9D9D]" />
            <span>{currentUserEmail}</span>
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2.5 mt-2">
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#FF9D9D]/20 text-[#D94545] uppercase tracking-wider">
              {user?.role || 'ADMIN'}
            </span>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#BBF1D2]/50 text-[#1E7741] uppercase tracking-wider flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3" />
              <span>ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3.5 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#FF9D9D] text-[#FF9D9D]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <FiUser className="w-4 h-4" />
          <span>Profile Details</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-6 py-3.5 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'border-[#FF9D9D] text-[#FF9D9D]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <FiLock className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div>
        {activeTab === 'profile' ? (
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-base font-black text-gray-900">Profile Information</h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Edit your administrative profile details and office contacts.
              </p>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="Fleur Admin"
                      {...profileForm.register('name', { required: 'Name is required' })}
                    />
                  </div>
                  {profileForm.formState.errors.name && (
                    <span className="text-[11px] font-bold text-red-500 mt-1 block">{profileForm.formState.errors.name.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      readOnly={true}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-100 text-xs font-semibold text-gray-500 border-none cursor-not-allowed"
                      placeholder="admin@fleur.com"
                      {...profileForm.register('email')}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone, DOB, and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="07056485362"
                      {...profileForm.register('phone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      {...profileForm.register('dob')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] cursor-pointer"
                    {...profileForm.register('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Bio area */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  Biography
                </label>
                <textarea
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] resize-none"
                  placeholder="Tell us about yourself..."
                  {...profileForm.register('bio')}
                />
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Location details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FiMapPin className="text-[#FF9D9D]" />
                  <span>Administrative Office Address</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="123 Studio Street"
                      {...profileForm.register('address')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="Varanasi"
                      {...profileForm.register('city')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="Uttar Pradesh"
                      {...profileForm.register('state')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                        placeholder="India"
                        {...profileForm.register('country')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                      Postal Code (Pincode)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                      placeholder="221005"
                      {...profileForm.register('postal_code')}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-[#EEF8CD] hover:bg-[#FF9D9D] text-[#2D252E] font-black px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {saveLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Change Password Card */
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 max-w-xxl space-y-6">
            <div>
              <h2 className="text-base font-black text-gray-900">Change Account Password</h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Update your administrative login credentials.
              </p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                    {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showCurrentPwd ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                    {...passwordForm.register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Must be at least 6 characters' } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showNewPwd ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
                    {...passwordForm.register('confirmPassword', { 
                      required: 'Confirm password is required', 
                      validate: v => v === newPasswordVal || 'Passwords do not match' 
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPwd ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Password */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="bg-[#EEF8CD] hover:bg-[#FF9D9D] text-[#2D252E] font-black px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {pwdLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiLock className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;