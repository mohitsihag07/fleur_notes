import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiHelpCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const UpdateFAQ = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    sort_order: 0,
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['General', 'Shipping', 'Returns', 'Orders', 'Payment', 'Account'];

  useEffect(() => {
    const fetchFaqDetails = async () => {
      setIsLoading(true);
      try {
        const res = await ApiInstance.get(`/faqs/${id}`);
        if (res.data?.success) {
          const data = res.data.data;
          setFormData({
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || 'General',
            sort_order: data.sort_order ?? 0,
            status: data.status || 'active'
          });
        }
      } catch (error) {
        console.error('Error fetching FAQ:', error);
        toast.error('Failed to load FAQ details');
        navigate('/faqs');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFaqDetails();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error('Question field is required');
      return;
    }
    if (!formData.answer.trim()) {
      toast.error('Answer field is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ApiInstance.put(`/faqs/update/${id}`, {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0
      });

      if (response.data?.success) {
        toast.success('FAQ updated successfully');
        navigate('/faqs');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to update FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#FF9D9D] text-sm">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading FAQ details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faqs')}
            className="p-2.5 rounded-2xl bg-white border border-gray-100 text-gray-700 hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer shadow-2xs"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Edit FAQ #{id}
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Modify existing FAQ question, answer, or category.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <FiHelpCircle className="w-5 h-5 text-[#FF9D9D]" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
            Edit FAQ Details
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="question"
              placeholder="Question..."
              value={formData.question}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
          </div>

          {/* Answer Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              name="answer"
              rows="6"
              placeholder="Answer..."
              value={formData.answer}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all resize-y"
            />
          </div>

          {/* Category & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Sort Order Priority
              </label>
              <input
                type="number"
                name="sort_order"
                min="0"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Status Radio Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF9D9D] focus:ring-[#FF9D9D]"
                />
                <span className="text-xs font-bold text-gray-800">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF9D9D] focus:ring-[#FF9D9D]"
                />
                <span className="text-xs font-bold text-gray-800">Inactive</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/faqs')}
              className="py-3 px-6 rounded-2xl bg-[#FAF5F7] text-xs font-black text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-3 px-8 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Update FAQ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFAQ;