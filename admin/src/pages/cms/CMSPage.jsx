import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiFileText, 
  FiUpload, 
  FiSave, 
  FiEye, 
  FiEdit3, 
  FiTrash2, 
  FiImage, 
  FiCheckCircle, 
  FiLoader,
  FiInfo,
  FiShield,
  FiBookOpen,
  FiBold,
  FiItalic,
  FiList,
  FiCode
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const CMSPage = () => {
  // Available Slugs config
  const cmsTabs = [
    { slug: 'about-us', label: 'About Us', icon: FiInfo, color: 'bg-[#FAF5EF] text-[#2B1B17]' },
    { slug: 'terms-and-conditions', label: 'Terms & Conditions', icon: FiBookOpen, color: 'bg-[#5F0917]/40 text-[#D96B3B]' },
    { slug: 'privacy-policy', label: 'Privacy Policy', icon: FiShield, color: 'bg-[#E8DACD]/50 text-[#1E7741]' }
  ];

  const [activeSlug, setActiveSlug] = useState('about-us');
  const [activeViewMode, setActiveViewMode] = useState('edit'); // 'edit' or 'preview'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Active Slug
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // Fetch CMS page content when activeSlug changes
  const fetchCmsData = useCallback(async (slug) => {
    setIsLoading(true);
    try {
      const res = await ApiInstance.get(`/cms/${slug}`);
      if (res.data?.success) {
        const page = res.data.data;
        setTitle(page.title || '');
        setDescription(page.description || '');
        setExistingImageUrl(page.image ? `${ApiInstance.defaults.baseURL.replace('/api/admin', '')}${page.image}` : '');
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error(`Error fetching CMS page for ${slug}:`, error);
      toast.error('Failed to load CMS content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCmsData(activeSlug);
  }, [activeSlug, fetchCmsData]);

  // Handle Tab Change
  const handleTabChange = (newSlug) => {
    if (newSlug === activeSlug) return;
    setActiveSlug(newSlug);
  };

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl('');
  };

  // Editor Toolbar Helper Functions
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('cms-description-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newText = description.substring(0, start) + replacement + description.substring(end);
    setDescription(newText);
  };

  // Save/Submit CMS Changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await ApiInstance.put(`/cms/${activeSlug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        toast.success(`CMS page "${activeSlug}" updated successfully!`);
        fetchCmsData(activeSlug);
      }
    } catch (error) {
      console.error('Error updating CMS page:', error);
      toast.error(error.response?.data?.message || 'Failed to update CMS page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTabInfo = cmsTabs.find((t) => t.slug === activeSlug);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A0C1E]/20 text-[#2B1B17]">
              <FiFileText className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Content Management System (CMS)
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Manage public store content, policies, terms, and banner images for all key pages in one place.
          </p>
        </div>

        {/* View Mode Switcher (Edit vs Live Preview) */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E8DACD] shadow-2xs self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveViewMode('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeViewMode === 'edit'
                ? 'bg-[#FAF5EF] text-[#2B1B17] shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeViewMode === 'preview'
                ? 'bg-[#FAF5EF] text-[#2B1B17] shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FiEye className="w-4 h-4" />
            <span>Live Store Preview</span>
          </button>
        </div>
      </div>

      {/* Single CMS Page Tabs (About Us, Terms & Conditions, Privacy Policy) */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-[#E8DACD] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {cmsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSlug === tab.slug;
          return (
            <button
              key={tab.slug}
              onClick={() => handleTabChange(tab.slug)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#7A0C1E] text-white shadow-md scale-[1.01]'
                  : 'bg-[#F2E6DA] text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main CMS Editor Body */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] p-8 relative min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-6 h-6 animate-spin" />
              <span>Loading {currentTabInfo?.label} Content...</span>
            </div>
          </div>
        ) : activeViewMode === 'edit' ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Slug Info Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD] text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-700">
                <span className="text-gray-400">Editing Slug:</span>
                <code className="px-2.5 py-1 rounded-lg bg-white border border-[#E8DACD] text-[#7A0C1E] font-mono font-black">
                  /page/{activeSlug}
                </code>
              </div>
              <span className="text-gray-400 text-[11px] font-semibold hidden md:inline">
                Changes will immediately update the customer-facing storefront.
              </span>
            </div>

            {/* Page Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. About Fleur Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#F2E6DA] text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all border-none"
              />
            </div>

            {/* Banner Image Upload Section */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                <span>Page Header Banner Image</span>
                <span className="text-[11px] text-gray-400 font-medium">Recommended: 1200x400px (Max 5MB)</span>
              </label>

              {imagePreview || existingImageUrl ? (
                <div className="relative rounded-3xl overflow-hidden border border-[#E8DACD] bg-gray-50 max-h-64 flex items-center justify-center group">
                  <img
                    src={imagePreview || existingImageUrl}
                    alt="CMS Header Banner"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="p-3 rounded-2xl bg-white text-gray-800 hover:bg-[#FAF5EF] font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2">
                      <FiUpload className="w-4 h-4" />
                      <span>Replace Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#E8DACD] rounded-3xl bg-[#F2E6DA] hover:bg-gray-100 transition-all cursor-pointer group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <div className="p-3 rounded-2xl bg-white text-[#7A0C1E] shadow-xs mb-3 group-hover:scale-110 transition-transform">
                      <FiImage className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-gray-700">
                      Click to upload banner image
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1">
                      PNG, JPG, WEBP, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Rich Editor / Formatted Content Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Page Content / Description
                </label>

                {/* Quick Formatting Toolbar */}
                <div className="flex items-center gap-1 bg-[#F2E6DA] p-1 rounded-xl border border-[#E8DACD]">
                  <button
                    type="button"
                    title="Bold"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 font-bold text-xs transition-all"
                  >
                    <FiBold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 font-bold text-xs transition-all"
                  >
                    <FiItalic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Heading"
                    onClick={() => insertFormatting('### ')}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 font-extrabold text-xs transition-all px-2"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() => insertFormatting('- ')}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 transition-all"
                  >
                    <FiList className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Code / Quote Block"
                    onClick={() => insertFormatting('> ')}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 transition-all"
                  >
                    <FiCode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                id="cms-description-textarea"
                rows="14"
                placeholder={`Write the comprehensive content for ${currentTabInfo?.label}...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-5 rounded-3xl bg-[#F2E6DA] text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-y leading-relaxed font-sans border-none"
              />

              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 px-2">
                <span>Markdown & HTML supported</span>
                <span>{description.length} Characters</span>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#E8DACD]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-3.5 px-8 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Save {currentTabInfo?.label} Page</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* LIVE PREVIEW MODE */
          <div className="space-y-6 max-w-3xl mx-auto py-4">
            <div className="p-3 bg-[#FAF5EF] rounded-2xl text-xs font-bold text-[#2B1B17] flex items-center justify-between">
              <span>Customer Storefront Preview Mode</span>
              <span className="font-mono text-[11px]">slug: /{activeSlug}</span>
            </div>

            {/* Banner Preview */}
            {(imagePreview || existingImageUrl) && (
              <div className="rounded-3xl overflow-hidden shadow-sm h-64 w-full">
                <img
                  src={imagePreview || existingImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Page Title */}
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {title || currentTabInfo?.label}
            </h1>

            {/* Page Body Preview */}
            <div className="prose max-w-none text-gray-700 text-xs font-normal leading-relaxed whitespace-pre-line bg-[#F2E6DA] p-8 rounded-3xl border border-[#E8DACD]">
              {description || <span className="italic text-gray-400">No content entered for this page yet.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSPage;
