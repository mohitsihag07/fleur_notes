import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiTag,
  FiBox,
  FiCalendar,
  FiClock,
  FiLayers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance, { getBackendURL } from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const GetCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const backendUrl = getBackendURL();

  const [category, setCategory] = useState(null);
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

  // Fetch Category Details
  const fetchCategoryDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get(`/categories/${id}`);
      if (response.data.success) {
        setCategory(response.data.data);
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
  }, [id, navigate]);

  useEffect(() => {
    fetchCategoryDetails();
  }, [fetchCategoryDetails]);

  // Confirm Delete Category
  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/categories/delete/${id}`);
      if (response.data.success) {
        toast.success(`Category "${category?.name}" deleted successfully`);
        setDeleteModalState({ isOpen: false, isDeleting: false });
        navigate('/categories');
      }
    } catch (error) {
      console.error('Category deletion failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
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

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-base">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading Category Details...</span>
        </div>
      </div>
    );
  }

  if (!category) return null;

  const linkedProducts = category.products || [];
  const imageUrl = formatImageUrl(category.image);
  const isActive = category.status === 'active';

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/categories')}
            className="p-2.5 rounded-2xl bg-white text-gray-700 border border-[#E8DACD] hover:bg-[#FAF5EF] hover:text-[#2B1B17] shadow-sm transition-all cursor-pointer"
            title="Back to Categories"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Category Details
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Viewing metadata and linked products for ID #{category.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/categories/edit/${category.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FAF5EF] hover:bg-[#E8DACD] text-[#2B1B17] font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiEdit2 className="w-4 h-4 text-[#88A626]" />
            <span>Edit Category</span>
          </button>

          <button
            onClick={() => setDeleteModalState({ isOpen: true, isDeleting: false })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Category</span>
          </button>
        </div>
      </div>

      {/* Main Category Profile Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] flex flex-col md:flex-row gap-8 items-start">
        {/* Category Cover Image Box */}
        <div className="w-full md:w-64 h-52 rounded-3xl overflow-hidden bg-[#F2E6DA] border border-[#E8DACD] shrink-0 flex items-center justify-center relative shadow-inner">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black">
                <FiTag className="w-7 h-7 text-[#88A626]" />
              </div>
              <span className="text-xs font-bold text-gray-400">No Image Uploaded</span>
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex-1 space-y-5">
          {/* Header row: Name, Slug, Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DACD] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {category.name}
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
              <p className="text-xs font-mono font-bold text-gray-400 mt-1">
                slug: /{category.slug}
              </p>
            </div>

            {/* Total Linked Products Metric Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD]">
              <div className="w-8 h-8 rounded-xl bg-[#7A0C1E] text-white flex items-center justify-center font-black">
                <FiBox className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Linked Products
                </div>
                <div className="text-sm font-black text-gray-900">
                  {linkedProducts.length} Items
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1">
              Description
            </span>
            <p className="text-sm font-medium text-gray-700 bg-gray-50/70 p-4 rounded-2xl border border-[#E8DACD] leading-relaxed">
              {category.description || 'No description provided for this category.'}
            </p>
          </div>

          {/* Metadata Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-1">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#7A0C1E]" />
              <span>Created: {formatDate(category.created_at || category.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#5F0917]" />
              <span>Last Updated: {formatDate(category.updated_at || category.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Products Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLayers className="w-5 h-5 text-[#7A0C1E]" />
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Linked Products ({linkedProducts.length})
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Products assigned to category "{category.name}"
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden">
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2E6DA] text-gray-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
                {linkedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 font-bold">
                      No products currently assigned to this category.
                    </td>
                  </tr>
                ) : (
                  linkedProducts.map((product) => {
                    const primaryImg = product.images?.find((img) => img.is_thumbnail)?.image || product.images?.[0]?.image;
                    const prodImgUrl = formatImageUrl(primaryImg);
                    const prodActive = product.status === 'active';
                    const stockQty = product.inventory?.quantity ?? 0;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Product Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {prodImgUrl ? (
                              <img
                                src={prodImgUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded-2xl object-cover border border-[#E8DACD] shrink-0 shadow-2xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black shrink-0">
                                <FiBox className="w-5 h-5 text-[#88A626]" />
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-gray-900 leading-snug">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-400 font-mono font-semibold">
                                /{product.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-extrabold text-gray-900">
                          ${product.price}
                          {product.sale_price && (
                            <span className="text-xs text-rose-500 font-semibold ml-1.5">
                              (Sale: ${product.sale_price})
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-gray-700">
                            {stockQty} units
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${
                              prodActive
                                ? 'bg-[#E8DACD]/60 text-[#1E7741]'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {prodActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-6 text-right text-gray-400 text-xs font-semibold">
                          {formatDate(product.created_at || product.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Category"
        message={`Are you sure you want to delete category "${category.name}"? Products assigned to this category may be unlinked.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GetCategory;