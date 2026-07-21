import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiInstance from '../../utils/ApiInstance';
import { 
  FiArrowLeft, 
  FiUploadCloud, 
  FiCheckCircle, 
  FiImage, 
  FiLayers,
  FiLink,
  FiType
} from 'react-icons/fi';

const AddBanner = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    button_text: '',
    button_link: '',
    display_order: 0,
    status: 'active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleImageUpload = async (file) => {
    const data = new FormData();
    data.append('image', file);
    const res = await ApiInstance.post('/banners/upload-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data?.success && res.data.data?.imageUrl) {
      return res.data.data.imageUrl;
    }
    throw new Error('Image upload failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await handleImageUpload(imageFile);
        setUploadingImage(false);
      }

      if (!finalImageUrl) {
        setErrorMsg('Please upload a banner image.');
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        image: finalImageUrl,
        display_order: parseInt(formData.display_order) || 0
      };

      const res = await ApiInstance.post('/banners/add', payload);
      if (res.data?.success) {
        navigate('/banners');
      }
    } catch (err) {
      console.error('Error adding banner:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to add banner.');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/banners"
          className="inline-flex items-center gap-2 text-xs font-black text-gray-600 hover:text-[#FF9D9D] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Banners</span>
        </Link>
      </div>

      <div className="bg-[#FAF5F7] rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiLayers className="w-6 h-6 text-[#FF9D9D]" />
            <span>Create Promotional Banner</span>
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Add a new promotional hero slide or CTA banner to the store.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        
        {/* Banner Image Upload Box */}
        <div>
          <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
            Banner Image <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center hover:border-[#FF9D9D] transition-colors bg-[#FAF5F7]/50">
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Banner preview"
                  className="max-h-60 w-full object-cover rounded-2xl shadow-sm mx-auto"
                />
                <div className="flex justify-center gap-3">
                  <label className="px-4 py-2 bg-white text-[#2D252E] rounded-full text-xs font-black shadow-sm cursor-pointer hover:bg-[#EEF8CD]">
                    <span>Change Image</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-2 py-4">
                <FiUploadCloud className="w-10 h-10 text-[#FF9D9D] mx-auto" />
                <p className="text-xs font-black text-gray-800">Click to upload banner image</p>
                <p className="text-[11px] font-medium text-gray-400">PNG, JPG, WEBP, AVIF up to 10MB (Recommended size: 1920x600px)</p>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
              Banner Title
            </label>
            <div className="relative">
              <FiType className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Summer Flowers Collection 2026"
                className="w-full pl-11 pr-4 py-3 bg-[#FAF5F7] rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 bg-[#FAF5F7] rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
            Subtitle / Description
          </label>
          <textarea
            rows={2}
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g. Discover handpicked floral arrangements with up to 30% off..."
            className="w-full p-4 bg-[#FAF5F7] rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
          />
        </div>

        {/* CTA Button Text & Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
              Button Text (CTA)
            </label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              placeholder="e.g. Shop Now"
              className="w-full px-4 py-3 bg-[#FAF5F7] rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
              Button Redirect URL / Link
            </label>
            <div className="relative">
              <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                placeholder="e.g. /category/bouquets or https://..."
                className="w-full pl-11 pr-4 py-3 bg-[#FAF5F7] rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D]"
              />
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div>
          <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs font-black cursor-pointer transition-colors ${
              formData.status === 'active' ? 'bg-[#EEF8CD] border-[#2D252E] text-[#2D252E]' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={() => setFormData({ ...formData, status: 'active' })}
                className="hidden"
              />
              <FiCheckCircle className="w-4 h-4" />
              <span>Active</span>
            </label>

            <label className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs font-black cursor-pointer transition-colors ${
              formData.status === 'inactive' ? 'bg-gray-200 border-gray-400 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={() => setFormData({ ...formData, status: 'inactive' })}
                className="hidden"
              />
              <span>Inactive</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link
            to="/banners"
            className="px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="px-8 py-3 rounded-full bg-[#FF9D9D] hover:bg-[#ff8b8b] text-[#2D252E] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Saving Banner...' : 'Publish Banner'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddBanner;
