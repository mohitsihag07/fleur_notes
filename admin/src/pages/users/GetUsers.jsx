import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiTrash2, 
  FiLoader,
  FiChevronDown
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const GetUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch single user details
  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get(`/users/${id}`);
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        toast.error('User not found');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error(error.response?.data?.message || 'Failed to load user details');
      navigate('/users');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await ApiInstance.put(`/users/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`User status updated to ${newStatus.toUpperCase()}`);
        setUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await ApiInstance.delete(`/users/${id}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        navigate('/users');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-[#E8DACD]/50 text-[#1E7741] border-[#E8DACD]';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-gray-200 text-gray-700 border-[#E8DACD]';
      default:
        return 'bg-[#5F0917]/50 text-[#D96B3B] border-[#5F0917]';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-base">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Fetching User Details...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl = user.profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF9D9D&color=2D252E&size=128`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/users')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-[#E8DACD] hover:bg-[#FAF5EF] hover:text-[#2B1B17] shadow-sm transition-all cursor-pointer"
            title="Back to Users"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              User Overview
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Viewing account credentials and shipping profile for ID #{user.id}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50 text-red-500 font-extrabold text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-xs"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete User</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8DACD] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover p-1 ring-4 ring-[#7A0C1E] shadow-md shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF9D9D&color=2D252E&size=128`;
            }}
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {user.name || 'Unnamed User'}
              </h3>
              {user.is_email_verified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-[#E8DACD]/40 text-[#249454]">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-700">
                  <FiXCircle className="w-3.5 h-3.5" />
                  Unverified
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-500 flex items-center justify-center sm:justify-start gap-2">
              <FiMail className="w-4 h-4 text-[#7A0C1E]" />
              <span>{user.email}</span>
            </p>

            <p className="text-xs font-semibold text-gray-400 flex items-center justify-center sm:justify-start gap-2 pt-1">
              <FiCalendar className="w-3.5 h-3.5 text-[#56D896]" />
              <span>Member since {formatDate(user.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Change Status Dropdown Widget */}
        <div className="bg-[#F2E6DA] p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#E8DACD] shrink-0 w-full md:w-auto">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
            Account Status
          </span>
          <div className="relative inline-block w-full">
            <select
              value={user.status || 'active'}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`w-full appearance-none px-4 py-2 pr-8 rounded-full text-xs font-black tracking-wide border uppercase focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer transition-all ${getStatusColorClass(user.status || 'active')}`}
            >
              <option value="active" className="bg-white text-gray-800">Active</option>
              <option value="inactive" className="bg-white text-gray-800">Inactive</option>
              <option value="blocked" className="bg-white text-gray-800">Blocked</option>
              <option value="suspended" className="bg-white text-gray-800">Suspended</option>
            </select>
            <FiChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
          </div>
        </div>
      </div>

      {/* Grid of Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Details Card */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD] space-y-5">
          <h4 className="text-base font-black text-gray-900 flex items-center gap-2.5 border-b border-[#E8DACD] pb-4">
            <FiUser className="w-5 h-5 text-[#7A0C1E]" />
            <span>Account Details</span>
          </h4>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">User ID</span>
              <span className="font-extrabold text-gray-800">#{user.id}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Role</span>
              <span className="font-extrabold text-gray-800 uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px]">
                {user.role || 'user'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Phone Number</span>
              <span className="font-extrabold text-gray-800">
                {user.phone ? `${user.country_code || ''} ${user.phone}` : 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Gender</span>
              <span className="font-extrabold text-gray-800 capitalize">
                {user.profile?.gender || 'Not specified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Date of Birth</span>
              <span className="font-extrabold text-gray-800">
                {user.profile?.date_of_birth ? formatDate(user.profile.date_of_birth) : 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* System & Metadata Card */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD] space-y-5">
          <h4 className="text-base font-black text-gray-900 flex items-center gap-2.5 border-b border-[#E8DACD] pb-4">
            <FiShield className="w-5 h-5 text-[#5F0917]" />
            <span>Security & Timestamps</span>
          </h4>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Email Verification</span>
              <span className={`font-black text-[11px] ${user.is_email_verified ? 'text-[#249454]' : 'text-amber-600'}`}>
                {user.is_email_verified ? 'Verified Account' : 'Pending Verification'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Phone Verification</span>
              <span className={`font-black text-[11px] ${user.is_phone_verified ? 'text-[#249454]' : 'text-gray-400'}`}>
                {user.is_phone_verified ? 'Verified Phone' : 'Not Verified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8DACD]/50">
              <span className="text-gray-400">Created At</span>
              <span className="font-extrabold text-gray-800">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Last Modified</span>
              <span className="font-extrabold text-gray-800">
                {formatDate(user.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Section (Full Width) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD] space-y-5">
          <h4 className="text-base font-black text-gray-900 flex items-center gap-2.5 border-b border-[#E8DACD] pb-4">
            <FiMapPin className="w-5 h-5 text-[#56D896]" />
            <span>Saved Shipping & Billing Addresses</span>
          </h4>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr, idx) => (
                <div 
                  key={addr.id || idx} 
                  className="bg-[#F2E6DA] p-5 rounded-2xl border border-[#E8DACD] space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-gray-900 uppercase tracking-wider">
                      Address #{idx + 1}
                    </span>
                    {addr.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8DACD] text-[#2B1B17] font-black text-[10px]">
                        Default Address
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 leading-relaxed pt-1 space-y-0.5">
                    <p className="font-bold">{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode}</p>
                    <p className="text-gray-400 font-bold text-[11px] pt-1">{addr.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs font-bold bg-[#F2E6DA] rounded-2xl">
              No saved addresses found for this user.
            </div>
          )}
        </div>

      </div>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteUser}
        isLoading={isDeleting}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${user.name || 'User'}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GetUsers;
