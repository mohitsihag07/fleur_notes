import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiTag,
  FiPercent,
  FiCalendar,
  FiClock,
  FiUsers,
  FiShoppingBag,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const GetCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [coupon, setCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Fetch Coupon Details
  const fetchCouponDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get(`/coupons/${id}`);
      if (response.data.success) {
        setCoupon(response.data.data);
      } else {
        toast.error('Coupon not found');
        navigate('/coupons');
      }
    } catch (error) {
      console.error('Error fetching coupon details:', error);
      toast.error(error.response?.data?.message || 'Failed to load coupon details');
      navigate('/coupons');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCouponDetails();
  }, [fetchCouponDetails]);

  // Confirm Delete Coupon Action
  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/coupons/delete/${id}`);
      if (response.data.success) {
        toast.success(`Coupon code "${coupon?.code}" deleted successfully`);
        setDeleteModalState({ isOpen: false, isDeleting: false });
        navigate('/coupons');
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#FF9D9D] text-base">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading Coupon Details...</span>
        </div>
      </div>
    );
  }

  if (!coupon) return null;

  const isActive = coupon.status === 'active';
  const isPercentage = coupon.type === 'percentage';
  const usagesList = coupon.usages || [];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/coupons')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-gray-100 hover:bg-[#EEF8CD] hover:text-[#2D252E] shadow-sm transition-all cursor-pointer"
            title="Back to Coupons"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Coupon Details
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Viewing promotion settings, usage stats, and redemption history for ID #{coupon.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EEF8CD] hover:bg-[#E2F2AF] text-[#2D252E] font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiEdit2 className="w-4 h-4 text-[#88A626]" />
            <span>Edit Coupon</span>
          </button>

          <button
            onClick={() => setDeleteModalState({ isOpen: true, isDeleting: false })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Coupon</span>
          </button>
        </div>
      </div>

      {/* Main Coupon Profile Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Header row: Code Badge, Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-[#EEF8CD] text-[#2D252E] flex items-center justify-center font-black border border-[#EEF8CD] shadow-sm">
              <FiTag className="w-7 h-7 text-[#88A626]" />
            </div>
            <div>
              <span className="px-4 py-1.5 rounded-2xl bg-[#FAF5F7] text-gray-900 font-mono font-black text-xl border border-gray-200 uppercase tracking-widest block w-fit">
                {coupon.code}
              </span>
              <span className="text-xs font-semibold text-gray-400 mt-1 block">
                Discount Code ID #{coupon.id}
              </span>
            </div>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${
              isActive
                ? 'bg-[#BBF1D2]/60 text-[#1E7741]'
                : coupon.status === 'expired'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {coupon.status}
          </span>
        </div>

        {/* Stats Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Value */}
          <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Discount Value
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {isPercentage ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
            </span>
          </div>

          {/* Min Cart Amount */}
          <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Minimum Cart Required
            </span>
            <span className="text-2xl font-black text-gray-900">
              {coupon.minimum_amount > 0 ? `₹${coupon.minimum_amount}` : 'None'}
            </span>
          </div>

          {/* Max Discount Cap */}
          <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Max Discount Cap
            </span>
            <span className="text-2xl font-black text-gray-900">
              {coupon.maximum_discount ? `₹${coupon.maximum_discount}` : 'Uncapped'}
            </span>
          </div>

          {/* Total Usages */}
          <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Usage Count / Limit
            </span>
            <span className="text-2xl font-black text-gray-900">
              {coupon.usage_count || 0} / {coupon.usage_limit || '∞'}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-700">
          <div>
            <span className="text-xs text-gray-400 font-bold block mb-0.5">Per User Limit:</span>
            <span>{coupon.per_user_limit || 1} use(s) per customer</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block mb-0.5">Expiration Date:</span>
            <span>{formatDate(coupon.expiry_date)}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-[#FF9D9D]" />
            <span>Created: {formatDate(coupon.created_at || coupon.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-[#FFC5AA]" />
            <span>Last Updated: {formatDate(coupon.updated_at || coupon.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Redemption History / Coupon Usages */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF8CD] text-[#2D252E] flex items-center justify-center font-black">
            <FiUsers className="w-5 h-5 text-[#88A626]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Redemption History ({usagesList.length})
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Customers who have redeemed this coupon code
            </p>
          </div>
        </div>

        {usagesList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-bold space-y-2">
            <FiShoppingBag className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
            <p className="text-sm">No customers have redeemed this coupon code yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF5F7] text-gray-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Discount Applied</th>
                  <th className="py-3.5 px-4 text-right">Redeemed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {usagesList.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-black text-xs">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 text-xs">
                            {usage.user?.name || `User #${usage.user_id}`}
                          </div>
                          <div className="text-[11px] text-gray-400 font-semibold">
                            {usage.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-gray-800">
                      {usage.order_id ? `#${usage.order_id}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 text-xs">
                      ₹{usage.discount_amount}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-400 text-xs font-semibold">
                      {formatDate(usage.created_at || usage.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${coupon.code}"? This action cannot be undone.`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GetCoupon;
