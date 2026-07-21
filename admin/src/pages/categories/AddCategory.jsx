import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiTag, 
  FiLoader, 
  FiCheck,
  FiFileText,
  FiActivity,
  FiUploadCloud,
  FiImage,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const AddCategory = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Name Input & Auto-Slug Generation
  const handleNameChange = (val) => {
    const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug
    }));
  };

  // Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = new FormData();
      postData.append('name', formData.name.trim());
      postData.append('slug', formData.slug.trim());
      postData.append('description', formData.description.trim());
      postData.append('status', formData.status);

      if (selectedFile) {
        postData.append('image', selectedFile);
      }

      const response = await ApiInstance.post('/categories/add', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Category added successfully!');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/categories')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-gray-100 hover:bg-[#EEF8CD] hover:text-[#2D252E] shadow-sm transition-all cursor-pointer"
            title="Back to Categories"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Add New Category
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Create a new category for your store catalog
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card Header Tag */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF8CD] text-[#2D252E] flex items-center justify-center font-black">
              <FiTag className="w-5 h-5 text-[#88A626]" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Category Details & Banner Image
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                Upload category cover image, set catalog names, and configure visibility.
              </p>
            </div>
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiImage className="w-3.5 h-3.5 text-[#FF9D9D]" />
              <span>Category Cover Image</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full sm:w-72 h-44 rounded-2xl overflow-hidden border-2 border-[#FF9D9D]/50 shadow-md group">
                <img
                  src={imagePreview}
                  alt="Category Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer shadow-lg"
                    title="Remove Image"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 hover:border-[#FF9D9D] bg-[#FAF5F7] hover:bg-[#EEF8CD]/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-white text-[#FF9D9D] flex items-center justify-center shadow-xs">
                  <FiUploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-gray-800 block">
                    Click to upload category image
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400">
                    PNG, JPG, WEBP or GIF (max 10MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Floral Journals"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30 transition-all outline-none font-semibold"
              />
            </div>

            {/* Category Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Category Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. floral-journals"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30 transition-all outline-none font-mono text-xs"
              />
              <p className="text-[11px] text-gray-400 font-semibold mt-1">
                URL friendly identifier (e.g. store.com/category/floral-journals)
              </p>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiActivity className="w-3.5 h-3.5 text-[#FF9D9D]" />
              <span>Category Status</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm font-black border border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30 transition-all outline-none cursor-pointer"
            >
              <option value="active">Active (Visible in Store)</option>
              <option value="inactive">Inactive (Hidden from Store)</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-[#FFC5AA]" />
              <span>Description</span>
            </label>
            <textarea
              rows="4"
              placeholder="Provide a description for this category..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm border border-gray-200 focus:border-[#FF9D9D] focus:ring-2 focus:ring-[#FF9D9D]/30 transition-all outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="py-3 px-6 rounded-2xl bg-[#FAF5F7] font-black text-xs text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 rounded-2xl bg-[#FF9D9D] hover:bg-[#F58383] text-[#2D252E] font-black text-xs shadow-md shadow-rose-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCategory;