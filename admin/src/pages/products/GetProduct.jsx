import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiBox,
  FiCalendar,
  FiClock,
  FiLayers,
  FiTag,
  FiStar,
  FiMessageSquare,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance, { getBackendURL } from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const GetProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const backendUrl = getBackendURL();

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Helper to resolve full image URL
  const formatImageUrl = useCallback((imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${backendUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  }, [backendUrl]);

  // Fetch Product Details
  const fetchProductDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error(error.response?.data?.message || 'Failed to load product details');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Confirm Delete Product
  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/products/delete/${id}`);
      if (response.data.success) {
        toast.success(`Product "${product?.name}" deleted successfully`);
        setDeleteModalState({ isOpen: false, isDeleting: false });
        navigate('/products');
      }
    } catch (error) {
      console.error('Product deletion failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Helper for Date Formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for Rating Stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-base">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading Product Details...</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const productImages = product.images || [];
  const selectedImageObj = productImages[selectedImageIndex] || productImages[0];
  const activeImageUrl = formatImageUrl(selectedImageObj?.image);
  const isActive = product.status === 'active';
  const stockQty = product.inventory?.quantity ?? 0;

  // Calculate Average Rating & Reviews Summary
  const reviewsList = product.reviews || [];
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-[#E8DACD] hover:bg-[#FAF5EF] hover:text-[#2B1B17] shadow-sm transition-all cursor-pointer"
            title="Back to Products"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Product Details
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Viewing product profile, tags, reviews, image gallery, and stock status for ID #{product.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FAF5EF] hover:bg-[#E8DACD] text-[#2B1B17] font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiEdit2 className="w-4 h-4 text-[#88A626]" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={() => setDeleteModalState({ isOpen: true, isDeleting: false })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Product</span>
          </button>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] flex flex-col md:flex-row gap-8 items-start">
        {/* Cover Image Box & Gallery Thumbnails */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          {/* Main Featured Image Box */}
          <div className="w-full h-72 rounded-3xl overflow-hidden bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-center relative shadow-inner">
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black">
                  <FiBox className="w-8 h-8 text-[#88A626]" />
                </div>
                <span className="text-xs font-bold text-gray-400">No Image Uploaded</span>
              </div>
            )}
          </div>

          {/* 4 Images Gallery Thumbnails List */}
          {productImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.slice(0, 4).map((imgObj, idx) => {
                const imgUrl = formatImageUrl(imgObj.image);
                const isSelected = selectedImageIndex === idx;

                return (
                  <button
                    key={imgObj.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7A0C1E] ring-2 ring-[#7A0C1E]/30 scale-105'
                        : 'border-[#E8DACD] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex-1 space-y-6">
          {/* Header row: Name, Category, Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DACD] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {product.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    isActive
                      ? 'bg-[#E8DACD]/60 text-[#1E7741]'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-1.5 text-xs font-semibold text-gray-400">
                <span>SKU: <strong className="font-mono text-gray-700">{product.sku || 'N/A'}</strong></span>
                <span>•</span>
                <span>slug: <strong className="font-mono text-gray-700">/{product.slug}</strong></span>
              </div>
            </div>

            {/* Category Tag Pill */}
            {product.category?.name && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] font-black text-xs">
                <FiLayers className="w-4 h-4 text-[#88A626]" />
                <span>{product.category.name}</span>
              </div>
            )}
          </div>

          {/* Product Tags Display */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <FiTag className="w-3.5 h-3.5" /> Tags:
              </span>
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full bg-[#F2E6DA] text-gray-700 text-xs font-extrabold border border-[#E8DACD]"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Pricing & Inventory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Regular Price */}
            <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Regular Price
              </span>
              <span className="text-xl font-black text-gray-900">
                ₹{product.price}
              </span>
            </div>

            {/* Sale Price */}
            <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Sale Price
              </span>
              <span className="text-xl font-black text-rose-500">
                {product.sale_price ? `₹${product.sale_price}` : 'None'}
              </span>
            </div>

            {/* Stock Quantity */}
            <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Available Stock
              </span>
              <span className={`text-xl font-black ${stockQty > 5 ? 'text-gray-900' : 'text-rose-600'}`}>
                {stockQty} units
              </span>
            </div>
          </div>

          {/* Physical Specifications & Badges */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
              Physical Specifications & Flags
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-2xl border border-[#E8DACD] text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Color</span>
                <span className="font-extrabold text-gray-900">{product.color || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Weight</span>
                <span className="font-extrabold text-gray-900">{product.weight ? `${product.weight} kg` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Dimensions (L×W×H)</span>
                <span className="font-extrabold text-gray-900">
                  {(product.length || product.width || product.height)
                    ? `${product.length || '-'} × ${product.width || '-'} × ${product.height || '-'} cm`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Special Flags</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(product.is_new_arrival || product.is_new) && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">New</span>
                  )}
                  {(product.is_best_seller || product.is_bestseller) && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Bestseller</span>
                  )}
                  {product.is_featured && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Featured</span>
                  )}
                  {!product.is_new_arrival && !product.is_new && !product.is_best_seller && !product.is_bestseller && !product.is_featured && (
                    <span className="text-gray-400 font-semibold">Standard</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1">
              Description
            </span>
            <p className="text-sm font-medium text-gray-700 bg-gray-50/70 p-4 rounded-2xl border border-[#E8DACD] leading-relaxed whitespace-pre-line">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          {/* Metadata Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-1">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#7A0C1E]" />
              <span>Created: {formatDate(product.created_at || product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#5F0917]" />
              <span>Last Updated: {formatDate(product.updated_at || product.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DACD] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black">
              <FiMessageSquare className="w-5 h-5 text-[#88A626]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Customer Reviews ({totalReviews})
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Feedback and ratings submitted for this product
              </p>
            </div>
          </div>

          {/* Rating Summary Badge */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-3 bg-[#F2E6DA] px-4 py-2.5 rounded-2xl border border-[#E8DACD]">
              <span className="text-2xl font-black text-amber-500">{avgRating}</span>
              <div>
                {renderStars(Math.round(avgRating))}
                <span className="text-[11px] font-bold text-gray-400 mt-0.5 block">
                  Based on {totalReviews} review{totalReviews > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        {reviewsList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-bold space-y-2">
            <FiMessageSquare className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
            <p className="text-sm">No reviews submitted for this product yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsList.map((rev) => {
              const reviewerName = rev.user?.name || 'Anonymous Customer';
              const reviewerEmail = rev.user?.email || 'N/A';

              return (
                <div key={rev.id} className="p-5 rounded-2xl bg-[#F2E6DA]/60 border border-[#E8DACD] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-gray-700 flex items-center justify-center font-black shadow-xs border border-[#E8DACD]">
                        <FiUser className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-gray-900 block leading-tight">
                          {reviewerName}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {reviewerEmail}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderStars(rev.rating)}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        rev.status === 'approved'
                          ? 'bg-[#E8DACD]/60 text-[#1E7741]'
                          : rev.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rev.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {rev.review || 'No written comment provided.'}
                  </p>

                  {/* Admin Reply if present */}
                  {rev.admin_reply && (
                    <div className="mt-2 pl-4 border-l-2 border-[#7A0C1E] py-1 text-xs font-medium text-gray-600 bg-white/70 rounded-r-xl p-3">
                      <strong className="text-gray-900 block mb-0.5">Admin Response:</strong>
                      {rev.admin_reply}
                    </div>
                  )}

                  <div className="text-[11px] font-semibold text-gray-400 pt-1">
                    Submitted on {formatDate(rev.created_at || rev.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Product"
        message={`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GetProduct;