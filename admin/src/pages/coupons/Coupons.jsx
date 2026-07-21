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
  FiCheck
} from 'react-icons/fi';
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
          limit: 9, // 9 items per page (3x3 grid)
          search,
          status
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        setCoupons(responseData.data || []);
        setTotalItems(responseData.meta?.totalItems || 0);
        setTotalPages(responseData.meta?.totalPages || 1);
        setCurrentPage(responseData.meta?.currentPage || 1);
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
    try {
      const response = await ApiInstance.put(`/coupons/update-status/${coupon.id}`);
      if (response.data.success) {
        const updatedCoupon = response.data.data;
        const newStatus = updatedCoupon.status || (coupon.status === 'active' ? 'inactive' : 'active');
        toast.success(`Coupon "${coupon.code}" status changed to ${newStatus.toUpperCase()}`);
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, status: newStatus } : c))
        );
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
      couponId: coupon.id,
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Coupons & Discounts
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Manage promotional discount cards, usage limits, and expiration rules.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Total Pill */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm">
            <FiTag className="w-4 h-4 text-[#FF9D9D]" />
            <span className="text-xs font-black text-gray-800">
              {totalItems} Coupons
            </span>
          </div>

          {/* Add Coupon Button */}
          <button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF9D9D] hover:bg-[#F58383] text-[#2D252E] font-black text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF5F7] text-sm font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative flex items-center gap-2 bg-[#FAF5F7] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 w-full sm:w-auto justify-end">
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

      {/* Main Grid Container: 3 Cards Per Row */}
      <div className="relative min-h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl">
            <div className="flex items-center gap-3 font-black text-[#FF9D9D] text-sm">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Coupons...</span>
            </div>
          </div>
        )}

        {!isLoading && coupons.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-bold border border-gray-100 shadow-sm space-y-2">
            <FiTag className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
            <p>No coupons found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isActive = coupon.status === 'active';
              const isPercentage = coupon.type === 'percentage';
              const usageText = `${coupon.usage_count || 0} / ${coupon.usage_limit || '∞'}`;

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between relative group overflow-hidden"
                >
                  {/* Decorative pastel banner strip at top */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-[#EEF8CD]" />

                  <div>
                    {/* Header: Coupon Code & Status Pill */}
                    <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                      {/* Code Pill with Copy Action */}
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-2xl bg-[#FAF5F7] text-gray-900 font-mono font-black text-sm border border-gray-200 tracking-wider uppercase shadow-2xs">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1.5 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <FiCopy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Clickable Status Badge */}
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer select-none uppercase ${
                          isActive
                            ? 'bg-[#BBF1D2]/60 text-[#1E7741] hover:bg-[#BBF1D2]'
                            : coupon.status === 'expired'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title="Click to change status"
                      >
                        {coupon.status}
                      </button>
                    </div>

                    {/* Big Discount Hero Box */}
                    <div className="p-4 rounded-2xl bg-[#FAF5F7]/80 border border-gray-100 mb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Discount Value
                        </span>
                        <div className="text-2xl font-black text-emerald-600 tracking-tight flex items-center gap-1">
                          {isPercentage ? (
                            <>
                              <FiPercent className="w-5 h-5" />
                              <span>{coupon.value}% OFF</span>
                            </>
                          ) : (
                            <span>₹{coupon.value} OFF</span>
                          )}
                        </div>
                      </div>

                      {/* Max Cap if Percentage */}
                      {coupon.maximum_discount && isPercentage && (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Max Cap</span>
                          <span className="text-xs font-black text-gray-700">₹{coupon.maximum_discount}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-5 font-semibold text-gray-600">
                      {/* Min Cart Required */}
                      <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase mb-0.5">Min Order</span>
                        <span className="font-extrabold text-gray-900">
                          {coupon.minimum_amount > 0 ? `₹${coupon.minimum_amount}` : 'No Minimum'}
                        </span>
                      </div>

                      {/* Usage Limits */}
                      <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase mb-0.5">Usage Used</span>
                        <span className="font-extrabold text-gray-900">{usageText}</span>
                      </div>
                    </div>

                    {/* Expiry Date Bar */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 bg-[#EEF8CD]/40 p-2.5 rounded-2xl">
                      <FiCalendar className="w-4 h-4 text-[#88A626]" />
                      <span>Expires: <strong>{formatDate(coupon.expiry_date)}</strong></span>
                    </div>
                  </div>

                  {/* Actions Bar Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400">ID #{coupon.id}</span>

                    <div className="flex items-center gap-2">
                      {/* View Eye Button */}
                      <button
                        onClick={() => handleViewCoupon(coupon.id)}
                        title="View Coupon Details"
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer shadow-2xs"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditCoupon(coupon.id)}
                        title="Edit Coupon Page"
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer shadow-2xs"
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
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white rounded-3xl px-6 py-4 shadow-sm border border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>
            Showing page {currentPage} of {totalPages} ({totalItems} total coupons)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-black">
              {currentPage}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer"
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
