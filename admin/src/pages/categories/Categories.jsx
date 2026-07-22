import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiEye,
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiFolder,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiBox
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance, { getBackendURL } from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stats State
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    totalProducts: 0
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    isDeleting: false
  });

  const backendUrl = getBackendURL();

  // Fetch categories list from API
  const fetchCategories = useCallback(async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/categories', {
        params: {
          page,
          limit: 10,
          search,
          status
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        setCategories(responseData.data || []);
        setTotalItems(responseData.meta?.totalItems || 0);
        setTotalPages(responseData.meta?.totalPages || 1);
        setCurrentPage(responseData.meta?.currentPage || 1);

        if (responseData.meta?.stats) {
          setStats(responseData.meta.stats);
        } else {
          const catList = responseData.data || [];
          setStats({
            totalCategories: responseData.meta?.totalItems || catList.length,
            activeCategories: catList.filter(c => c.status === 'active').length,
            inactiveCategories: catList.filter(c => c.status === 'inactive').length,
            totalProducts: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCategories, currentPage, searchTerm, statusFilter]);

  // Navigate to Add Category Page
  const handleAddCategory = () => {
    navigate('/categories/add');
  };

  // Navigate to Category View Details Page
  const handleViewCategory = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  // Navigate to Edit Category Page
  const handleEditCategory = (categoryId) => {
    navigate(`/categories/edit/${categoryId}`);
  };

  // Handle status toggle on click
  const handleToggleStatus = async (category) => {
    try {
      const response = await ApiInstance.put(`/categories/update-status/${category.id}`);
      if (response.data.success) {
        const updatedCategory = response.data.data;
        const newStatus = updatedCategory.status;
        toast.success(`Category "${category.name}" status changed to ${newStatus.toUpperCase()}`);
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, status: newStatus } : c))
        );
        fetchCategories(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Status change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Open Delete Modal
  const openDeleteModal = (category) => {
    setDeleteModalState({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
      isDeleting: false
    });
  };

  // Confirm Delete Category Action
  const handleConfirmDelete = async () => {
    const { categoryId, categoryName } = deleteModalState;
    if (!categoryId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/categories/delete/${categoryId}`);
      if (response.data.success) {
        toast.success(`Category "${categoryName}" deleted successfully`);
        setDeleteModalState({ isOpen: false, categoryId: null, categoryName: '', isDeleting: false });
        fetchCategories(currentPage, searchTerm, statusFilter);
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
      year: 'numeric'
    });
  };

  // Helper to format category image URL
  const getCategoryImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${backendUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Categories Management
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Organize catalog items, manage store categories, and control visibility.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Total Pill */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-[#E8DACD] shadow-sm">
            <FiFolder className="w-4 h-4 text-[#7A0C1E]" />
            <span className="text-xs font-black text-gray-800">
              {totalItems} Categories
            </span>
          </div>

          {/* Add Category Button -> Direct Navigation */}
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs shadow-md shadow-red-900/10 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Categories</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalCategories}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiFolder className="w-5 h-5" />
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Categories</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeCategories}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/40 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Categories */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive Categories</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.inactiveCategories}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalProducts}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <FiBox className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search category name or slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F2E6DA] text-sm font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Categories...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2E6DA] text-gray-400 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Category Info</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
              {!isLoading && categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 font-bold">
                    No categories found matching your query.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const isActive = category.status === 'active';
                  const imageUrl = getCategoryImageUrl(category.image);

                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      {/* Category Info with Inline Cover Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-[#E8DACD] shrink-0 shadow-2xs"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black shrink-0 border border-[#FAF5EF]">
                              <FiTag className="w-5 h-5 text-[#88A626]" />
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-gray-900 leading-snug">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-400 font-mono font-semibold">
                              /{category.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6">
                        <p className="text-xs text-gray-600 line-clamp-2 max-w-xs font-normal">
                          {category.description || 'No description provided.'}
                        </p>
                      </td>

                      {/* Clickable Status Badge */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-[#E8DACD]/60 text-[#1E7741] hover:bg-[#E8DACD]'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title="Click to change status"
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-gray-400 text-xs font-semibold">
                        {formatDate(category.created_at || category.createdAt)}
                      </td>

                      {/* Action Buttons: View Eye, Edit, Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Eye Button */}
                          <button
                            onClick={() => handleViewCategory(category.id)}
                            title="View Category Details"
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer shadow-2xs"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditCategory(category.id)}
                            title="Edit Category Page"
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer shadow-2xs"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(category)}
                            title="Delete Category"
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F2E6DA] flex items-center justify-between border-t border-[#E8DACD] text-xs font-bold text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} total categories)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-white text-gray-800 font-black">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Category Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, categoryId: null, categoryName: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteModalState.categoryName}"? Products assigned to this category may be unlinked.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Categories;