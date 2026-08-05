import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiTag, 
  FiLoader, 
  FiCheck,
  FiFileText,
  FiActivity,
  FiUploadCloud,
  FiImage,
  FiX,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance, { getBackendURL } from '../../utils/ApiInstance';

const UpdateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const backendUrl = getBackendURL();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    existingImage: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to build proper image URL
  const formatImageUrl = useCallback((imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${backendUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  }, [backendUrl]);

  // Fetch category details
  const fetchCategoryDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await ApiInstance.get(`/categories/${id}`);
      if (response.data.success) {
        const cat = response.data.data;
        setFormData({
          name: cat.name || '',
          slug: cat.slug || '',
          description: cat.description || '',
          status: cat.status || 'active',
          existingImage: cat.image || ''
        });

        if (cat.image) {
          setImagePreview(formatImageUrl(cat.image));
        }
      } else {
        toast.error('Category not found');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      toast.error(error.response?.data?.message || 'Failed to load category details');
      navigate('/categories');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, formatImageUrl]);

  useEffect(() => {
    fetchCategoryDetails();
  }, [fetchCategoryDetails]);

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
    setFormData((prev) => ({ ...prev, existingImage: '' }));
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
      } else if (formData.existingImage) {
        postData.append('image', formData.existingImage);
      } else {
        postData.append('image', '');
      }

      const response = await ApiInstance.put(`/categories/update/${id}`, postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Category updated successfully!');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-base">
          <FiLoader className="w-6 h-6 animate-spin text-[#7A0C1E]" />
          <span>Loading Category Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/categories')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-[#E8DACD] hover:bg-[#FAF5EF] hover:text-[#7A0C1E] shadow-sm transition-all cursor-pointer"
            title="Back to Categories"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Update Category
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Modifying details for category ID #{id}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card Header Tag */}
          <div className="flex items-center gap-3 border-b border-[#E8DACD] pb-5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] flex items-center justify-center font-black border border-[#E8DACD]">
              <FiTag className="w-5 h-5 text-[#7A0C1E]" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Update Category Information
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                Update category image, name, slug, description, and status settings.
              </p>
            </div>
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiImage className="w-3.5 h-3.5 text-[#7A0C1E]" />
              <span>Category Cover Image</span>
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-full sm:w-72 h-48 rounded-2xl overflow-hidden border-2 border-[#7A0C1E] shadow-md bg-[#FAF5EF]">
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview(null)}
                  />
                </div>

                {/* Mobile & Desktop Accessible Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF5EF] hover:bg-[#E8DACD]/60 text-[#7A0C1E] border border-[#E8DACD] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95">
                    <FiRefreshCw className="w-4 h-4 text-[#7A0C1E]" />
                    <span>Replace / Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                    <span>Remove Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#E8DACD] hover:border-[#7A0C1E] bg-[#FAF5EF]/50 hover:bg-[#FAF5EF]/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-white text-[#7A0C1E] flex items-center justify-center shadow-xs border border-[#E8DACD]">
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
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF5EF] text-gray-900 text-sm border border-[#E8DACD]/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30 transition-all outline-none font-semibold"
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
                className="w-full px-4 py-3 rounded-xl bg-[#FAF5EF] text-gray-900 text-sm border border-[#E8DACD]/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30 transition-all outline-none font-mono text-xs"
              />
              <p className="text-[11px] text-gray-400 font-semibold mt-1">
                URL friendly identifier (e.g. store.com/category/floral-journals)
              </p>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiActivity className="w-3.5 h-3.5 text-[#7A0C1E]" />
              <span>Category Status</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF5EF] text-gray-900 text-sm font-black border border-[#E8DACD]/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30 transition-all outline-none cursor-pointer"
            >
              <option value="active">Active (Visible in Store)</option>
              <option value="inactive">Inactive (Hidden from Store)</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-[#5F0917]" />
              <span>Description</span>
            </label>
            <textarea
              rows="4"
              placeholder="Provide a description for this category..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-[#FAF5EF] text-gray-900 text-sm border border-[#E8DACD]/80 focus:border-[#7A0C1E] focus:ring-2 focus:ring-[#7A0C1E]/30 transition-all outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E8DACD] pt-6">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="py-3 px-6 rounded-2xl bg-[#FAF5EF] border border-[#E8DACD] font-black text-xs text-[#7A0C1E] hover:bg-[#E8DACD] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Update Category</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateCategory;