import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiHelpCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const AddFAQ = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    sort_order: 0,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['General', 'Shipping', 'Returns', 'Orders', 'Payment', 'Account'];

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
      const response = await ApiInstance.post('/faqs/add', {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0
      });

      if (response.data?.success) {
        toast.success('FAQ created successfully');
        navigate('/faqs');
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to create FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faqs')}
            className="p-2.5 rounded-2xl bg-white border border-[#E8DACD] text-gray-700 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] transition-all cursor-pointer shadow-2xs"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Add New FAQ
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Create a new frequently asked question and answer for customers.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#E8DACD]">
          <FiHelpCircle className="w-5 h-5 text-[#7A0C1E]" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
            FAQ Information
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
              placeholder="e.g. How long does shipping take?"
              value={formData.question}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
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
              placeholder="Provide a detailed, clear answer to the question..."
              value={formData.answer}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-y"
            />
          </div>

          {/* Category & Sort Order Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category Dropdown/Custom */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-extrabold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Sort Order Priority
              </label>
              <input
                type="number"
                name="sort_order"
                min="0"
                placeholder="0"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
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
                  className="w-4 h-4 text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
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
                  className="w-4 h-4 text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                />
                <span className="text-xs font-bold text-gray-800">Inactive</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DACD]">
            <button
              type="button"
              onClick={() => navigate('/faqs')}
              className="py-3 px-6 rounded-2xl bg-[#FAF5EF] border border-[#E8DACD] text-xs font-black text-[#7A0C1E] hover:bg-[#E8DACD] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save FAQ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFAQ;