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
  FiCode,
  FiPlus,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const ICON_OPTIONS = [
  { value: 'heart', label: '❤️ Heart' },
  { value: 'leaf', label: '🌿 Leaf' },
  { value: 'shield-check', label: '🛡️ Shield Check' },
  { value: 'star', label: '⭐ Star' },
  { value: 'sparkles', label: '✨ Sparkles' },
  { value: 'check-circle', label: '✅ Check Circle' },
];

const CMSPage = () => {
  const cmsTabs = [
    { slug: 'about-us', label: 'About Us', icon: FiInfo, color: 'bg-[#FAF5EF] text-[#7A0C1E]' },
    { slug: 'terms-and-conditions', label: 'Terms & Conditions', icon: FiBookOpen, color: 'bg-[#FAF5EF] text-[#7A0C1E]' },
    { slug: 'privacy-policy', label: 'Privacy Policy', icon: FiShield, color: 'bg-[#FAF5EF] text-[#7A0C1E]' }
  ];

  const [activeSlug, setActiveSlug] = useState('about-us');
  const [activeViewMode, setActiveViewMode] = useState('edit');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Standard fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // About Us specific fields
  const [valuesSectionTitle, setValuesSectionTitle] = useState('More Than Just Products');
  const [valuesSectionSubtitle, setValuesSectionSubtitle] = useState('OUR VALUES');
  const [valuesSectionDescription, setValuesSectionDescription] = useState('');
  const [valuesSectionImageFile, setValuesSectionImageFile] = useState(null);
  const [valuesSectionImagePreview, setValuesSectionImagePreview] = useState(null);
  const [existingValuesSectionImageUrl, setExistingValuesSectionImageUrl] = useState('');
  const [values, setValues] = useState(['Timeless designs that inspire', 'Handpicked materials, always', 'Small batch, maximum care', 'Made to be loved, made to last']);
  const [trustBadges, setTrustBadges] = useState([
    { icon: 'heart', title: 'Handmade with Love', description: 'Every piece is thoughtfully handcrafted with care.' },
    { icon: 'leaf', title: 'Sustainable & Ethical', description: 'We use eco-friendly materials and responsible practices.' },
    { icon: 'shield-check', title: 'Premium Quality', description: 'Quality you can see and feel in every single detail.' },
    { icon: 'star', title: 'Loved by Customers', description: 'Thousands of happy customers trust and love our products.' }
  ]);

  const baseUrl = ApiInstance.defaults.baseURL.replace('/api/admin', '');

  const fetchCmsData = useCallback(async (slug) => {
    setIsLoading(true);
    try {
      const res = await ApiInstance.get(`/cms/${slug}`);
      if (res.data?.success) {
        const page = res.data.data;
        setTitle(page.title || '');
        setDescription(page.description || '');
        setExistingImageUrl(page.image ? `${baseUrl}${page.image}` : '');
        setImageFile(null);
        setImagePreview(null);

        if (slug === 'about-us') {
          setValuesSectionTitle(page.values_section_title || 'More Than Just Products');
          setValuesSectionSubtitle(page.values_section_subtitle || 'OUR VALUES');
          setValuesSectionDescription(page.values_section_description || '');
          setExistingValuesSectionImageUrl(page.values_section_image ? `${baseUrl}${page.values_section_image}` : '');
          setValuesSectionImageFile(null);
          setValuesSectionImagePreview(null);
          setValues(page.values?.length ? page.values : ['Timeless designs that inspire', 'Handpicked materials, always', 'Small batch, maximum care', 'Made to be loved, made to last']);
          setTrustBadges(page.trust_badges?.length ? page.trust_badges : [
            { icon: 'heart', title: 'Handmade with Love', description: 'Every piece is thoughtfully handcrafted with care.' },
            { icon: 'leaf', title: 'Sustainable & Ethical', description: 'We use eco-friendly materials and responsible practices.' },
            { icon: 'shield-check', title: 'Premium Quality', description: 'Quality you can see and feel in every single detail.' },
            { icon: 'star', title: 'Loved by Customers', description: 'Thousands of happy customers trust and love our products.' }
          ]);
        }
      }
    } catch (error) {
      console.error(`Error fetching CMS page for ${slug}:`, error);
      toast.error('Failed to load CMS content');
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchCmsData(activeSlug);
  }, [activeSlug, fetchCmsData]);

  const handleTabChange = (newSlug) => {
    if (newSlug === activeSlug) return;
    setActiveSlug(newSlug);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return; }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); setExistingImageUrl(''); };

  const handleValuesSectionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return; }
      setValuesSectionImageFile(file);
      setValuesSectionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveValuesSectionImage = () => { setValuesSectionImageFile(null); setValuesSectionImagePreview(null); setExistingValuesSectionImageUrl(''); };

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

  // Values bullet helpers
  const addValue = () => setValues([...values, '']);
  const removeValue = (idx) => setValues(values.filter((_, i) => i !== idx));
  const updateValue = (idx, val) => { const arr = [...values]; arr[idx] = val; setValues(arr); };

  // Trust badge helpers
  const addBadge = () => setTrustBadges([...trustBadges, { icon: 'heart', title: '', description: '' }]);
  const removeBadge = (idx) => setTrustBadges(trustBadges.filter((_, i) => i !== idx));
  const updateBadge = (idx, field, val) => { const arr = [...trustBadges]; arr[idx] = { ...arr[idx], [field]: val }; setTrustBadges(arr); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // For About Us, title is not required since it's managed from Banners
    if (activeSlug !== 'about-us' && !title.trim()) { toast.error('Title is required'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      if (activeSlug === 'about-us') {
        formData.append('values_section_title', valuesSectionTitle);
        formData.append('values_section_subtitle', valuesSectionSubtitle);
        formData.append('values_section_description', valuesSectionDescription);
        formData.append('values', JSON.stringify(values.filter(v => v.trim())));
        formData.append('trust_badges', JSON.stringify(trustBadges));
        if (valuesSectionImageFile) formData.append('values_section_image', valuesSectionImageFile);
      }

      const res = await ApiInstance.put(`/cms/${activeSlug}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
            <div className="p-2.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
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

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E8DACD] shadow-2xs self-start sm:self-center">
          <button type="button" onClick={() => setActiveViewMode('edit')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${activeViewMode === 'edit' ? 'bg-[#FAF5EF] text-[#7A0C1E] shadow-2xs' : 'text-gray-500 hover:text-gray-900'}`}>
            <FiEdit3 className="w-4 h-4" /><span>Editor</span>
          </button>
          <button type="button" onClick={() => setActiveViewMode('preview')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${activeViewMode === 'preview' ? 'bg-[#FAF5EF] text-[#7A0C1E] shadow-2xs' : 'text-gray-500 hover:text-gray-900'}`}>
            <FiEye className="w-4 h-4" /><span>Live Store Preview</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-[#E8DACD] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {cmsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSlug === tab.slug;
          return (
            <button key={tab.slug} onClick={() => handleTabChange(tab.slug)} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-[#7A0C1E] text-white shadow-md scale-[1.01]' : 'bg-[#FAF5EF] text-gray-700 hover:bg-[#E8DACD]'}`}>
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Editor Body */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] p-8 relative min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-6 h-6 animate-spin" />
              <span>Loading {currentTabInfo?.label} Content...</span>
            </div>
          </div>
        ) : activeViewMode === 'edit' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Slug Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF5EF] border border-[#E8DACD] text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-700">
                <span className="text-gray-400">Editing Slug:</span>
                <code className="px-2.5 py-1 rounded-lg bg-white border border-[#E8DACD] text-[#7A0C1E] font-mono font-black">/page/{activeSlug}</code>
              </div>
              <span className="text-gray-400 text-[11px] font-semibold hidden md:inline">Changes will immediately update the customer-facing storefront.</span>
            </div>
            {/* ── About Us: Banner is managed in Banners module ── */}
          

            {/* Page Title & Description — hidden for About Us (managed from Banners) */}
            {activeSlug !== 'about-us' && (
              <>
                {/* Page Title */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Page Title <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. About Fleur Notes" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-[#FAF5EF] text-sm font-extrabold text-gray-900 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all" />
                </div>

                {/* Banner Image */}
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Page Header Banner Image</span>
                    <span className="text-[11px] text-gray-400 font-medium">Recommended: 1200x400px (Max 5MB)</span>
                  </label>
                  {imagePreview || existingImageUrl ? (
                    <div className="relative rounded-3xl overflow-hidden border border-[#E8DACD] bg-gray-50 max-h-64 flex items-center justify-center group">
                      <img src={imagePreview || existingImageUrl} alt="CMS Header Banner" className="w-full h-56 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="p-3 rounded-2xl bg-white text-gray-800 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2 transition-all">
                          <FiUpload className="w-4 h-4" /><span>Replace Image</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <button type="button" onClick={handleRemoveImage} className="p-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2">
                          <FiTrash2 className="w-4 h-4" /><span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#E8DACD] rounded-3xl bg-[#FAF5EF]/50 hover:bg-[#FAF5EF]/80 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <div className="p-3 rounded-2xl bg-white text-[#7A0C1E] border border-[#E8DACD] shadow-xs mb-3 group-hover:scale-110 transition-transform">
                          <FiImage className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-700">Click to upload banner image</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Page Content / Description</label>
                    <div className="flex items-center gap-1 bg-[#FAF5EF] p-1 rounded-xl border border-[#E8DACD]">
                      <button type="button" title="Bold" onClick={() => insertFormatting('**', '**')} className="p-1.5 rounded-lg hover:bg-white text-gray-700 font-bold text-xs transition-all"><FiBold className="w-3.5 h-3.5 text-[#7A0C1E]" /></button>
                      <button type="button" title="Italic" onClick={() => insertFormatting('*', '*')} className="p-1.5 rounded-lg hover:bg-white text-gray-700 font-bold text-xs transition-all"><FiItalic className="w-3.5 h-3.5 text-[#7A0C1E]" /></button>
                      <button type="button" title="Heading" onClick={() => insertFormatting('### ')} className="p-1.5 rounded-lg hover:bg-white text-[#7A0C1E] font-extrabold text-xs transition-all px-2">H3</button>
                      <button type="button" title="Bullet List" onClick={() => insertFormatting('- ')} className="p-1.5 rounded-lg hover:bg-white text-gray-700 transition-all"><FiList className="w-3.5 h-3.5 text-[#7A0C1E]" /></button>
                      <button type="button" title="Quote Block" onClick={() => insertFormatting('> ')} className="p-1.5 rounded-lg hover:bg-white text-gray-700 transition-all"><FiCode className="w-3.5 h-3.5 text-[#7A0C1E]" /></button>
                    </div>
                  </div>
                  <textarea id="cms-description-textarea" rows="8" placeholder={`Write the comprehensive content for ${currentTabInfo?.label}...`} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-5 rounded-3xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-y leading-relaxed font-sans" />
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 px-2">
                    <span>Markdown & HTML supported</span>
                    <span>{description.length} Characters</span>
                  </div>
                </div>
              </>
            )}

            {/* ── About Us Only Sections ── */}
            {activeSlug === 'about-us' && (
              <>
                <div className="border-t border-[#E8DACD] pt-8">
                  <h3 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7A0C1E] inline-block" />
                    Values Section
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Section Subtitle (e.g. OUR VALUES)</label>
                      <input type="text" value={valuesSectionSubtitle} onChange={(e) => setValuesSectionSubtitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-sm font-bold text-gray-900 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Section Heading</label>
                      <input type="text" value={valuesSectionTitle} onChange={(e) => setValuesSectionTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-sm font-bold text-gray-900 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Section Description</label>
                    <textarea rows="3" value={valuesSectionDescription} onChange={(e) => setValuesSectionDescription(e.target.value)} className="w-full p-4 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-y leading-relaxed" placeholder="Describe your brand values..." />
                  </div>

                  {/* Values Section Image */}
                  <div className="space-y-3 mb-5">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Values Section Image (Left Side)</span>
                      <span className="text-[11px] text-gray-400 font-medium">Recommended: 800x600px (Max 5MB)</span>
                    </label>
                    {valuesSectionImagePreview || existingValuesSectionImageUrl ? (
                      <div className="relative rounded-3xl overflow-hidden border border-[#E8DACD] bg-gray-50 max-h-64 flex items-center justify-center group">
                        <img src={valuesSectionImagePreview || existingValuesSectionImageUrl} alt="Values Section" className="w-full h-56 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="p-3 rounded-2xl bg-white text-gray-800 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2 transition-all">
                            <FiUpload className="w-4 h-4" /><span>Replace Image</span>
                            <input type="file" accept="image/*" onChange={handleValuesSectionImageChange} className="hidden" />
                          </label>
                          <button type="button" onClick={handleRemoveValuesSectionImage} className="p-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs cursor-pointer shadow-lg flex items-center gap-2">
                            <FiTrash2 className="w-4 h-4" /><span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E8DACD] rounded-3xl bg-[#FAF5EF]/50 hover:bg-[#FAF5EF]/80 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <div className="p-3 rounded-2xl bg-white text-[#7A0C1E] border border-[#E8DACD] shadow-xs mb-2 group-hover:scale-110 transition-transform">
                            <FiImage className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-black text-gray-700">Click to upload values section image</p>
                          <p className="text-[10px] font-semibold text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleValuesSectionImageChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Value Bullet Points</label>
                    <div className="space-y-2">
                      {values.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FiCheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <input type="text" value={val} onChange={(e) => updateValue(idx, e.target.value)} placeholder="e.g. Timeless designs that inspire" className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all" />
                          <button type="button" onClick={() => removeValue(idx)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer">
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addValue} className="flex items-center gap-2 text-xs font-black text-[#7A0C1E] hover:text-[#5F0917] py-2 px-4 rounded-xl border border-dashed border-[#7A0C1E]/30 hover:border-[#7A0C1E] transition-all cursor-pointer">
                      <FiPlus className="w-3.5 h-3.5" /><span>Add Bullet Point</span>
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="border-t border-[#E8DACD] pt-8">
                  <h3 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A87B39] inline-block" />
                    Trust Badges (4 Feature Cards)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trustBadges.map((badge, idx) => (
                      <div key={idx} className="relative bg-[#FAF5EF] border border-[#E8DACD] rounded-2xl p-5 space-y-3">
                        <button type="button" onClick={() => removeBadge(idx)} className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Icon</label>
                          <select value={badge.icon} onChange={(e) => updateBadge(idx, 'icon', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all cursor-pointer">
                            {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Title</label>
                          <input type="text" value={badge.title} onChange={(e) => updateBadge(idx, 'title', e.target.value)} placeholder="e.g. Handmade with Love" className="w-full px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Description</label>
                          <textarea rows="2" value={badge.description} onChange={(e) => updateBadge(idx, 'description', e.target.value)} placeholder="Short description..." className="w-full px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {trustBadges.length < 8 && (
                    <button type="button" onClick={addBadge} className="mt-4 flex items-center gap-2 text-xs font-black text-[#A87B39] hover:text-[#7A5C2A] py-2 px-4 rounded-xl border border-dashed border-[#A87B39]/40 hover:border-[#A87B39] transition-all cursor-pointer">
                      <FiPlus className="w-3.5 h-3.5" /><span>Add Trust Badge</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#E8DACD]">
              <button type="submit" disabled={isSubmitting} className="py-3.5 px-8 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]">
                {isSubmitting ? (<><FiLoader className="w-4 h-4 animate-spin" /><span>Saving Changes...</span></>) : (<><FiSave className="w-4 h-4" /><span>Save {currentTabInfo?.label} Page</span></>)}
              </button>
            </div>
          </form>
        ) : (
          /* LIVE PREVIEW MODE */
          <div className="space-y-6 max-w-3xl mx-auto py-4">
            <div className="p-3 bg-[#FAF5EF] border border-[#E8DACD] rounded-2xl text-xs font-bold text-[#7A0C1E] flex items-center justify-between">
              <span>Customer Storefront Preview Mode</span>
              <span className="font-mono text-[11px]">slug: /{activeSlug}</span>
            </div>
            {(imagePreview || existingImageUrl) && (
              <div className="rounded-3xl overflow-hidden shadow-sm h-64 w-full">
                <img src={imagePreview || existingImageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title || currentTabInfo?.label}</h1>
            <div className="prose max-w-none text-gray-700 text-xs font-normal leading-relaxed whitespace-pre-line bg-[#FAF5EF]/50 p-8 rounded-3xl border border-[#E8DACD]">
              {description || <span className="italic text-gray-400">No content entered for this page yet.</span>}
            </div>
            {activeSlug === 'about-us' && (
              <>
                <h2 className="text-xl font-black text-gray-800 pt-4">{valuesSectionTitle}</h2>
                <p className="text-sm text-gray-600">{valuesSectionDescription}</p>
                <ul className="space-y-2">{values.map((v, i) => v && <li key={i} className="flex items-center gap-2 text-xs font-medium text-gray-800"><FiCheckCircle className="text-green-600 w-4 h-4 shrink-0" />{v}</li>)}</ul>
                <div className="grid grid-cols-2 gap-4 pt-4">{trustBadges.map((b, i) => <div key={i} className="bg-[#FAF5EF] border border-[#E8DACD] rounded-2xl p-4"><p className="font-bold text-sm text-gray-900">{b.title}</p><p className="text-xs text-gray-500 mt-1">{b.description}</p></div>)}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSPage;
