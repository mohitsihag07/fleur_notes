import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUploadCloud, 
  FiX, 
  FiLoader,
  FiCheck,
  FiBox,
  FiLayers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    sale_price: '',
    quantity: '10',
    sku: '',
    slug: '',
    description: '',
    status: 'active'
  });

  // State for up to 4 images: Array of objects { file, preview }
  const [images, setImages] = useState([null, null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories for Dropdown
  useEffect(() => {
    const fetchCategoryOptions = async () => {
      try {
        const response = await ApiInstance.get('/categories?limit=100');
        if (response.data.success) {
          const list = response.data.data.data || [];
          setCategories(list);
          if (list.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: list[0].id }));
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories list');
      }
    };
    fetchCategoryOptions();
  }, []);

  // Handle Input Changes & Auto-generate Slug & SKU
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name') {
        const generatedSlug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        updated.slug = generatedSlug;
        if (!prev.sku) {
          updated.sku = `PRD-${value.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }
      return updated;
    });
  };

  // Handle Image Upload Selection for slot index (0 to 3)
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (PNG, JPG, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      const newImages = [...images];
      if (newImages[index]?.preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages[index] = {
        file,
        preview: URL.createObjectURL(file)
      };
      setImages(newImages);
    }
  };

  // Remove Selected Image from slot index
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages[index] = null;
    setImages(newImages);
  };

  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a product category');
      return;
    }

    if (!formData.price || isNaN(formData.price)) {
      toast.error('Please enter a valid product price');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      if (formData.sale_price) data.append('sale_price', formData.sale_price);
      data.append('quantity', formData.quantity || '0');
      if (formData.sku) data.append('sku', formData.sku.trim());
      if (formData.slug) data.append('slug', formData.slug.trim());
      data.append('description', formData.description.trim());
      data.append('status', formData.status);

      // Append up to 4 images
      images.forEach((imgObj) => {
        if (imgObj?.file) {
          data.append('images', imgObj.file);
        }
      });

      const response = await ApiInstance.post('/products/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Product "${formData.name}" created successfully!`);
        navigate('/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-gray-100 hover:bg-[#EEF8CD] hover:text-[#2D252E] shadow-sm transition-all cursor-pointer"
            title="Back to Products"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Add New Product
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Fill in product details, assign category, pricing, stock, and upload up to 4 product images.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Product Images Upload Grid (Up to 4 images) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
              Product Images (Up to 4 images)
            </label>
            <span className="text-xs font-semibold text-gray-400">
              First image will be the primary cover
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => {
              const imgObj = images[index];
              return (
                <div key={index} className="relative">
                  {imgObj?.preview ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[#FAF5F7] border border-gray-200 group shadow-inner">
                      <img
                        src={imgObj.preview}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#EEF8CD] text-[#2D252E] text-[10px] font-black uppercase">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-200 hover:border-[#FF9D9D] rounded-2xl h-40 flex flex-col items-center justify-center p-3 text-center bg-[#FAF5F7]/50 hover:bg-[#FAF5F7] transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-10 h-10 rounded-xl bg-[#EEF8CD] text-[#2D252E] flex items-center justify-center font-black group-hover:scale-110 transition-transform mb-1.5">
                        <FiUploadCloud className="w-5 h-5 text-[#88A626]" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {index === 0 ? 'Main Cover' : `Image ${index + 1}`}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        Upload
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Product Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiBox className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Handmade Scented Candle"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-bold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all cursor-pointer"
              >
                {categories.length === 0 && <option value="">Loading categories...</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Regular Price */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Regular Price (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                required
                placeholder="499.00"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Sale Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sale_price"
                placeholder="399.00 (optional)"
                value={formData.sale_price}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Stock Quantity (units)
            </label>
            <input
              type="number"
              min="0"
              name="quantity"
              placeholder="10"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
          </div>
        </div>

        {/* Identifiers & Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SKU */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              placeholder="Auto-generated if blank"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-mono font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              placeholder="Auto-generated slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF5F7] text-sm font-mono font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
            />
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
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            placeholder="Enter full product description details..."
            value={formData.description}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-[#FAF5F7] text-sm font-semibold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/products')}
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
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;