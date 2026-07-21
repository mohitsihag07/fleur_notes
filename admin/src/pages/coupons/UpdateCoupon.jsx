import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiLoader,
  FiCheck,
  FiTag,
  FiPercent,
  FiCalendar,
  FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const UpdateCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minimum_amount: '0',
    maximum_discount: '',
    usage_limit: '',
    per_user_limit: '1',
    expiry_date: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Coupon Details
  useEffect(() => {
    const fetchCoupon = async () => {
      setIsLoading(true);
      try {
        const response = await ApiInstance.get(`/coupons/${id}`);
        if (response.data.success) {
          const c = response.data.data;
          setFormData({
            code: c.code || '',
            type: c.type || 'percentage',
            value: c.value !== undefined ? c.value : '',
            minimum_amount: c.minimum_amount !== undefined ? c.minimum_amount : '0',
            maximum_discount: c.maximum_discount || '',
            usage_limit: c.usage_limit || '',
            per_user_limit: c.per_user_limit !== undefined ? c.per_user_limit : '1',
            expiry_date: c.expiry_date || '',
            status: c.status || 'active'
          });
        } else {
          toast.error('Coupon not found');
          navigate('/coupons');
        }
      } catch (error) {
        console.error('Error fetching coupon details:', error);
        toast.error('Failed to load coupon details');
        navigate('/coupons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, [id, navigate]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().replace(/\s+/g, '') : value
    }));
  };

  // Submit Coupon Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      toast.error('Percentage discount value cannot exceed 100%');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : 0,
        maximum_discount: formData.maximum_discount ? parseFloat(formData.maximum_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        per_user_limit: formData.per_user_limit ? parseInt(formData.per_user_limit) : 1,
        expiry_date: formData.expiry_date || null,
        status: formData.status
      };

      const response = await ApiInstance.put(`/coupons/update/${id}`, payload);

      if (response.data.success) {
        toast.success(`Coupon code "${formData.code}" updated successfully!`);
        navigate('/coupons');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-gray-100 hover:bg-[#EEF8CD] hover:text-[#2D252E] shadow-sm transition-all cursor-pointer"
            title="Back to Coupons"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Update Coupon #{id}
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Edit promotional coupon rules, usage limits, and expiration settings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Code & Type Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Coupon Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="code"
                required
                placeholder="Coupon Code"
                value={formData.code}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-mono font-black text-gray-900 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Discount Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-bold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all cursor-pointer"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Rupee Discount (₹)</option>
            </select>
          </div>
        </div>

        {/* Discount Value & Max Discount Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Value */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Discount Value ({formData.type === 'percentage' ? '%' : '₹'}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">
                {formData.type === 'percentage' ? '%' : '₹'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="value"
                required
                placeholder="Discount value"
                value={formData.value}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Maximum Discount Cap (for Percentage) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Max Discount Cap (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="maximum_discount"
                disabled={formData.type === 'fixed'}
                placeholder={formData.type === 'fixed' ? 'N/A for fixed discount' : 'Optional max cap'}
                value={formData.maximum_discount}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Cart Restrictions & Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Minimum Cart Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Minimum Cart Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="minimum_amount"
                placeholder="0"
                value={formData.minimum_amount}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Usage Limit (Total) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Total Usage Limit
            </label>
            <input
              type="number"
              min="1"
              name="usage_limit"
              placeholder="Unlimited"
              value={formData.usage_limit}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
          </div>

          {/* Per User Limit */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Per User Limit
            </label>
            <input
              type="number"
              min="1"
              name="per_user_limit"
              placeholder="1"
              value={formData.per_user_limit}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
          </div>
        </div>

        {/* Expiry Date & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Expiration Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-bold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#FF9D9D] hover:bg-[#F58383] text-[#2D252E] font-black text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Updating Coupon...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Update Coupon</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCoupon;
