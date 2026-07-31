import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiPercent,
  FiCalendar,
  FiShoppingBag,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { FaIndianRupeeSign as FiRuppeeSign } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Coupons = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Cards) or 'table'

  // Stats State
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    inactiveCoupons: 0,
    expiredCoupons: 0
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    couponId: null,
    couponCode: '',
    isDeleting: false
  });

  // Fetch Coupons list from API
  const fetchCoupons = useCallback(async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/coupons', {
        params: {
          page,
          limit: 9,
          search,
          status
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        const list = responseData.data || [];
        setCoupons(list);
        setTotalItems(responseData.meta?.totalItems || 0);
        setTotalPages(responseData.meta?.totalPages || 1);
        setCurrentPage(responseData.meta?.currentPage || 1);

        if (responseData.meta?.stats) {
          setStats(responseData.meta.stats);
        } else {
          setStats({
            totalCoupons: responseData.meta?.totalItems || list.length,
            activeCoupons: list.filter((c) => c.status === 'active').length,
            inactiveCoupons: list.filter((c) => c.status === 'inactive').length,
            expiredCoupons: list.filter((c) => c.status === 'expired').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCoupons, currentPage, searchTerm, statusFilter]);

  // Copy Code Helper
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Navigate Actions
  const handleAddCoupon = () => navigate('/coupons/add');
  const handleViewCoupon = (id) => navigate(`/coupons/${id}`);
  const handleEditCoupon = (id) => navigate(`/coupons/edit/${id}`);

  // Handle status toggle on click
  const handleToggleStatus = async (coupon) => {
    const cId = coupon._id || coupon.id;
    try {
      const response = await ApiInstance.put(`/coupons/update-status/${cId}`);
      if (response.data.success) {
        const updatedCoupon = response.data.data;
        const newStatus = updatedCoupon.status || (coupon.status === 'active' ? 'inactive' : 'active');
        toast.success(`Coupon "${coupon.code}" status changed to ${newStatus.toUpperCase()}`);
        setCoupons((prev) =>
          prev.map((c) => ((c._id || c.id) === cId ? { ...c, status: newStatus } : c))
        );
        fetchCoupons(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Status change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Open Delete Modal
  const openDeleteModal = (coupon) => {
    setDeleteModalState({
      isOpen: true,
      couponId: coupon._id || coupon.id,
      couponCode: coupon.code,
      isDeleting: false
    });
  };

  // Confirm Delete Coupon Action
  const handleConfirmDelete = async () => {
    const { couponId, couponCode } = deleteModalState;
    if (!couponId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/coupons/delete/${couponId}`);
      if (response.data.success) {
        toast.success(`Coupon "${couponCode}" deleted successfully`);
        setDeleteModalState({ isOpen: false, couponId: null, couponCode: '', isDeleting: false });
        fetchCoupons(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Coupon deletion failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Helper for Date Formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'No Expiry Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD]">
              <FiTag className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Coupons & Discounts
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Manage promotional discount cards, usage limits, and expiration rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Pill */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-[#E8DACD] shadow-sm">
            <FiTag className="w-4 h-4 text-[#7A0C1E]" />
            <span className="text-xs font-black text-gray-800">
              {totalItems} Coupons
            </span>
          </div>

          {/* Add Coupon Button */}
          <button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coupons */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Coupons</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalCoupons}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
            <FiTag className="w-5 h-5" />
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Coupons</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeCoupons}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#5F0917]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Coupons */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive Coupons</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.inactiveCoupons}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#F2E6DA]/40 text-[#7A0C1E]">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Coupons */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expired Coupons</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.expiredCoupons}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-gray-100 text-gray-500">
            <FiClock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with View Mode Toggle */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF5EF] text-sm font-semibold text-gray-700 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Controls: View Mode & Status Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* View Mode Toggle Switch (Cards / Table) */}
          <div className="flex items-center bg-[#FAF5EF] p-1 rounded-full border border-[#E8DACD]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${viewMode === 'grid'
                  ? 'bg-[#7A0C1E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FiGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${viewMode === 'table'
                  ? 'bg-[#7A0C1E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center gap-2 bg-[#FAF5EF] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 border border-[#E8DACD]">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Status:</span>
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
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards Grid OR Table View */}
      <div className="relative min-h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-5 h-5 animate-spin text-[#7A0C1E]" />
              <span>Loading Coupons...</span>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          /* Cards View Grid */
          !isLoading && coupons.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-bold border border-[#E8DACD] shadow-sm space-y-2">
              <FiTag className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
              <p>No coupons found matching your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => {
                const isActive = coupon.status === 'active';
                const isPercentage = coupon.type === 'percentage';
                const usedCount = (coupon.used_count !== undefined && coupon.used_count !== null)
                  ? coupon.used_count
                  : ((coupon.usage_count !== undefined && coupon.usage_count !== null) ? coupon.usage_count : 0);
                const usageText = `${usedCount} / ${coupon.usage_limit || '∞'}`;

                return (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-3xl border border-[#E8DACD] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between relative group overflow-hidden"
                  >
                    {/* Decorative pastel banner strip at top */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#FAF5EF]" />

                    <div>
                      {/* Header: Coupon Code & Status Pill */}
                      <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                        {/* Code Pill with Copy Action */}
                        <div className="flex items-center gap-2">
                          <span className="px-3.5 py-1.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] font-mono font-black text-sm border border-[#E8DACD] tracking-wider uppercase shadow-2xs">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1.5 rounded-xl bg-[#FAF5EF]/60 text-[#7A0C1E] hover:bg-[#FAF5EF] transition-all cursor-pointer border border-[#E8DACD]"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? (
                              <FiCheck className="w-3.5 h-3.5 text-[#5F0917]" />
                            ) : (
                              <FiCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Clickable Status Badge */}
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer select-none uppercase ${isActive
                              ? 'bg-[#FAF5EF] text-[#5F0917] border border-[#E8DACD] hover:bg-[#E8DACD]'
                              : coupon.status === 'expired'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          title="Click to change status"
                        >
                          {coupon.status}
                        </button>
                      </div>

                      {/* Big Discount Hero Box with Rupee Sign */}
                      <div className="p-4 rounded-2xl bg-[#FAF5EF]/50 border border-[#E8DACD] mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Discount Value
                          </span>
                          <div className="text-2xl font-black text-[#7A0C1E] tracking-tight flex items-center gap-1">
                            {isPercentage ? (
                              <>
                                <FiPercent className="w-5 h-5" />
                                <span>{coupon.value}% OFF</span>
                              </>
                            ) : (
                              <>
                                <FiRuppeeSign className="w-5 h-5 text-[#7A0C1E]" />
                                <span>{coupon.value} OFF</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Max Cap if Percentage */}
                        {coupon.maximum_discount && isPercentage && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Max Cap</span>
                            <span className="text-xs font-black text-gray-700 inline-flex items-center gap-0.5">
                              <FiRuppeeSign className="w-3 h-3 text-gray-700" />
                              <span>{coupon.maximum_discount}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata Grid Info */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-5 font-semibold text-gray-600">
                        {/* Min Cart Required */}
                        <div className="p-3 rounded-xl bg-[#FAF5EF]/30 border border-[#E8DACD]">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-0.5">Min Order</span>
                          <span className="font-extrabold text-gray-900 inline-flex items-center gap-0.5">
                            {coupon.minimum_amount > 0 ? (
                              <>
                                <FiRuppeeSign className="w-3 h-3 text-gray-800" />
                                <span>{coupon.minimum_amount}</span>
                              </>
                            ) : (
                              'No Minimum'
                            )}
                          </span>
                        </div>

                        {/* Usage Limits */}
                        <div className="p-3 rounded-xl bg-[#FAF5EF]/30 border border-[#E8DACD]">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-0.5">Usage Used</span>
                          <span className="font-extrabold text-gray-900">{usageText}</span>
                        </div>
                      </div>

                      {/* Expiry Date Bar */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 bg-[#FAF5EF]/40 p-2.5 rounded-2xl border border-[#E8DACD]">
                        <FiCalendar className="w-4 h-4 text-[#7A0C1E]" />
                        <span>Expires: <strong>{formatDate(coupon.expiry_date)}</strong></span>
                      </div>
                    </div>

                    {/* Actions Bar Footer */}
                    <div className="pt-4 border-t border-[#E8DACD] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400">ID #{coupon.id}</span>

                      <div className="flex items-center gap-2">
                        {/* View Eye Button */}
                        <button
                          onClick={() => handleViewCoupon(coupon.id)}
                          title="View Coupon Details"
                          className="p-2 rounded-xl bg-white text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white border border-[#E8DACD] transition-all cursor-pointer shadow-2xs"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditCoupon(coupon.id)}
                          title="Edit Coupon Page"
                          className="p-2 rounded-xl bg-white text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white border border-[#E8DACD] transition-all cursor-pointer shadow-2xs"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModal(coupon)}
                          title="Delete Coupon"
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF5EF] text-[#7A0C1E] font-extrabold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-6">Discount</th>
                    <th className="py-4 px-6">Min Order</th>
                    <th className="py-4 px-6">Max Cap</th>
                    <th className="py-4 px-6">Usage</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Expires</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DACD]/60 font-medium text-gray-700">
                  {!isLoading && coupons.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400 font-bold">
                        No coupons found matching your query.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => {
                      const isActive = coupon.status === 'active';
                      const isPercentage = coupon.type === 'percentage';
                      const usedCount = (coupon.used_count !== undefined && coupon.used_count !== null)
                        ? coupon.used_count
                        : ((coupon.usage_count !== undefined && coupon.usage_count !== null) ? coupon.usage_count : 0);
                      const usageText = `${usedCount} / ${coupon.usage_limit || '∞'}`;
                      const cId = coupon._id || coupon.id;

                      return (
                        <tr key={cId} className="hover:bg-[#FAF5EF]/40 transition-colors">
                          {/* Code */}
                          <td className="py-4 px-6">
                            <span className="px-3 py-1.5 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] font-mono font-black text-xs border border-[#E8DACD]">
                              {coupon.code}
                            </span>
                          </td>

                          {/* Discount Value */}
                          <td className="py-4 px-6 font-black text-[#7A0C1E]">
                            {isPercentage ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                          </td>

                          {/* Min Order */}
                          <td className="py-4 px-6 font-bold text-gray-800">
                            {coupon.minimum_amount > 0 ? `₹${coupon.minimum_amount}` : 'No Min'}
                          </td>

                          {/* Max Cap */}
                          <td className="py-4 px-6 font-semibold text-gray-600">
                            {coupon.maximum_discount ? `₹${coupon.maximum_discount}` : 'N/A'}
                          </td>

                          {/* Usage */}
                          <td className="py-4 px-6 font-semibold text-gray-600">
                            {usageText}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleToggleStatus(coupon)}
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${isActive
                                  ? 'bg-[#FAF5EF] text-[#5F0917] hover:bg-[#E8DACD]'
                                  : coupon.status === 'expired'
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}
                            >
                              {coupon.status}
                            </button>
                          </td>

                          {/* Expiry */}
                          <td className="py-4 px-6 text-xs text-gray-500 font-semibold">
                            {formatDate(coupon.expiry_date)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewCoupon(cId)}
                                title="View Coupon"
                                className="p-2 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer shadow-2xs"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditCoupon(cId)}
                                title="Edit Coupon"
                                className="p-2 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer shadow-2xs"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(coupon)}
                                title="Delete Coupon"
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
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white rounded-3xl px-6 py-4 shadow-sm border border-[#E8DACD] flex items-center justify-between text-xs font-bold text-gray-600">
          <span>
            Showing page {currentPage} of {totalPages} ({totalItems} total coupons)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] disabled:opacity-40 shadow-xs hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-[#7A0C1E] text-white font-black">
              {currentPage}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-2 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] disabled:opacity-40 shadow-xs hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Coupon Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, couponId: null, couponCode: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${deleteModalState.couponCode}"? This action cannot be undone.`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Coupons;
