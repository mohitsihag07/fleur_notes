import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiTrash2, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    blockedUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    isDeleting: false
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch users from API
  const fetchUsers = useCallback(async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/users', {
        params: {
          page,
          limit: 10,
          search,
          status,
          role: 'user'
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        setUsers(responseData.data || []);
        setTotalItems(responseData.meta?.totalItems || 0);
        setTotalPages(responseData.meta?.totalPages || 1);
        setCurrentPage(responseData.meta?.currentPage || 1);
        if (responseData.meta?.stats) {
          setStats(responseData.meta.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers, currentPage, searchTerm, statusFilter]);

  // Handle inline status update from dropdown
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await ApiInstance.put(`/users/${userId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Status updated to ${newStatus.toUpperCase()}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Trigger Delete Modal
  const openDeleteModal = (userId, userName) => {
    setDeleteModalState({
      isOpen: true,
      userId,
      userName: userName || 'User',
      isDeleting: false
    });
  };

  // Confirm Delete User Action
  const handleConfirmDeleteUser = async () => {
    const { userId, userName } = deleteModalState;
    if (!userId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success(`User "${userName}" deleted successfully`);
        setDeleteModalState({ isOpen: false, userId: null, userName: '', isDeleting: false });
        fetchUsers(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('User deletion failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // View User Details Page
  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper for Status Badge Color
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Users Management
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Manage customer accounts, verify credentials, and view details.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiUsers className="w-5 h-5" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeUsers}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/50 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Verified Users */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verified Users</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.verifiedUsers}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <FiShield className="w-5 h-5" />
          </div>
        </div>

        {/* Blocked/Inactive Users */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Blocked & Inactive</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.blockedUsers}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-red-50 text-red-600">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F2E6DA] text-sm font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Users...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2E6DA] text-gray-400 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">User Info</th>
                <th className="py-4 px-6">Phone / Address</th>
                <th className="py-4 px-6">Verification</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">Status (Change)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-bold">
                    No users found matching your query.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const avatarUrl = user.profile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF9D9D&color=2D252E`;
                  const primaryAddress = user.addresses && user.addresses[0];
                  const currentStatus = user.status || 'active';
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={avatarUrl} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#7A0C1E]/60 shadow-xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF9D9D&color=2D252E`;
                            }}
                          />
                          <div>
                            <div className="font-extrabold text-gray-900 leading-snug">
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className="text-xs text-gray-400 font-semibold">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Address */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-800 text-xs">
                          {user.phone ? `${user.country_code || ''} ${user.phone}` : 'No phone'}
                        </div>
                        {primaryAddress ? (
                          <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                            {[primaryAddress.city, primaryAddress.country].filter(Boolean).join(', ')}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400">No address recorded</div>
                        )}
                      </td>

                      {/* Verification Badge */}
                      <td className="py-4 px-6">
                        {user.is_email_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#E8DACD]/40 text-[#249454]">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-700">
                            <FiXCircle className="w-3.5 h-3.5" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-gray-400 text-xs font-semibold">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status Dropdown Column */}
                      <td className="py-4 px-6">
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className={`appearance-none px-3 py-1.5 pr-7 rounded-full text-xs font-black tracking-wide border uppercase focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer transition-all ${getStatusColorClass(currentStatus)}`}
                          >
                            <option value="active" className="bg-white text-gray-800">Active</option>
                            <option value="inactive" className="bg-white text-gray-800">Inactive</option>
                            <option value="blocked" className="bg-white text-gray-800">Blocked</option>
                            <option value="suspended" className="bg-white text-gray-800">Suspended</option>
                          </select>
                          <FiChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Action Icon Buttons: Eye & Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Eye Button */}
                          <button
                            onClick={() => handleViewUser(user.id)}
                            title="View User Details Page"
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer shadow-2xs"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(user.id, user.name)}
                            title="Delete User"
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F2E6DA] flex items-center justify-between border-t border-[#E8DACD] text-xs font-bold text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-white text-gray-800 font-black">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, userId: null, userName: '', isDeleting: false })}
        onConfirm={handleConfirmDeleteUser}
        isLoading={deleteModalState.isDeleting}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${deleteModalState.userName}"? All associated data will be deleted.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Users;