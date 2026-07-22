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
  FiBox,
  FiLayers,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance, { getBackendURL } from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Cards) or 'table'

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    productId: null,
    productName: '',
    isDeleting: false
  });

  const backendUrl = getBackendURL();

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCategoryOptions = async () => {
      try {
        const response = await ApiInstance.get('/categories?limit=100');
        if (response.data.success) {
          setCategories(response.data.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching category options:', error);
      }
    };
    fetchCategoryOptions();
  }, []);

  // Fetch products list from API
  const fetchProducts = useCallback(async (page = 1, search = '', status = '', categoryId = '') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/products', {
        params: {
          page,
          limit: 12,
          search,
          status,
          category_id: categoryId
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        const prodList = responseData.data || [];
        setProducts(prodList);
        setTotalItems(responseData.meta?.totalItems || 0);
        setTotalPages(responseData.meta?.totalPages || 1);
        setCurrentPage(responseData.meta?.currentPage || 1);

        if (responseData.meta?.stats) {
          setStats(responseData.meta.stats);
        } else {
          setStats({
            totalProducts: responseData.meta?.totalItems || prodList.length,
            activeProducts: prodList.filter((p) => p.status === 'active').length,
            inactiveProducts: prodList.filter((p) => p.status === 'inactive').length,
            lowStockProducts: prodList.filter((p) => (p.inventory?.quantity ?? 0) <= 5).length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts, currentPage, searchTerm, statusFilter, categoryFilter]);

  // Navigate Actions
  const handleAddProduct = () => navigate('/products/add');
  const handleViewProduct = (id) => navigate(`/products/${id}`);
  const handleEditProduct = (id) => navigate(`/products/edit/${id}`);

  // Handle status toggle on click
  const handleToggleStatus = async (product) => {
    try {
      const response = await ApiInstance.put(`/products/update-status/${product.id}`);
      if (response.data.success) {
        const updatedProduct = response.data.data;
        const newStatus = updatedProduct.status || (product.status === 'active' ? 'inactive' : 'active');
        toast.success(`Product "${product.name}" status changed to ${newStatus.toUpperCase()}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
        fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
      }
    } catch (error) {
      console.error('Status change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Open Delete Modal
  const openDeleteModal = (product) => {
    setDeleteModalState({
      isOpen: true,
      productId: product.id,
      productName: product.name,
      isDeleting: false
    });
  };

  // Confirm Delete Product Action
  const handleConfirmDelete = async () => {
    const { productId, productName } = deleteModalState;
    if (!productId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/products/delete/${productId}`);
      if (response.data.success) {
        toast.success(`Product "${productName}" deleted successfully`);
        setDeleteModalState({ isOpen: false, productId: null, productName: '', isDeleting: false });
        fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
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
      year: 'numeric'
    });
  };

  // Helper to format product primary image URL
  const getProductImageUrl = (product) => {
    const primaryImgObj = product.images?.find((img) => img.is_thumbnail)?.image || product.images?.[0]?.image;
    if (!primaryImgObj) return null;
    if (primaryImgObj.startsWith('http://') || primaryImgObj.startsWith('https://')) {
      return primaryImgObj;
    }
    return `${backendUrl}${primaryImgObj.startsWith('/') ? '' : '/'}${primaryImgObj}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Products Management
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Manage inventory items, pricing, store categories, and product status.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Total Pill */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-[#E8DACD] shadow-sm">
            <FiBox className="w-4 h-4 text-[#7A0C1E]" />
            <span className="text-xs font-black text-gray-800">
              {totalItems} Products
            </span>
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs shadow-md shadow-red-900/10 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalProducts}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiBox className="w-5 h-5" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Products</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeProducts}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/40 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive Products</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.inactiveProducts}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Low / Out of Stock */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Low / Out of Stock</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.lowStockProducts}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with View Mode Toggle */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search product name, SKU, or slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F2E6DA] text-sm font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Filters and View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* View Mode Toggle Switch (Cards / Table) */}
          <div className="flex items-center bg-[#F2E6DA] p-1 rounded-full border border-[#E8DACD]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#7A0C1E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#7A0C1E] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="relative flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiLayers className="w-3.5 h-3.5 text-gray-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Status:</span>
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

      {/* Main Content Area: Cards Grid OR Table View */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Products...</span>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          /* Cards View Grid */
          <div className="p-6 min-h-[350px]">
            {!isLoading && products.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-bold">
                <FiBox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No products found matching your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const isActive = product.status === 'active';
                  const imageUrl = getProductImageUrl(product);
                  const stockQty = product.inventory?.quantity ?? 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-[#E8DACD] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      {/* Product Thumbnail & Overlay Status */}
                      <div className="relative h-48 w-full bg-[#FAF5EF] overflow-hidden flex items-center justify-center border-b border-[#E8DACD]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <FiBox className="w-10 h-10 text-[#88A626]" />
                            <span className="text-[10px] font-bold">No Image</span>
                          </div>
                        )}

                        {/* Clickable Status Badge & Highlight Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer w-fit ${
                              isActive
                                ? 'bg-[#FAF5EF] text-[#1E7741] border border-[#E8DACD]'
                                : 'bg-red-100 text-red-600 border border-red-200'
                            }`}
                            title="Click to change status"
                          >
                            {isActive ? (
                              <FiCheckCircle className="w-3 h-3 text-[#1E7741]" />
                            ) : (
                              <FiXCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span>{isActive ? 'Active' : 'Inactive'}</span>
                          </button>

                          {(product.is_new_arrival || product.is_new) && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase shadow-xs w-fit">
                              🏷️ NEW
                            </span>
                          )}
                          {(product.is_best_seller || product.is_bestseller) && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase shadow-xs w-fit">
                              🔥 BESTSELLER
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase shadow-xs w-fit">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>

                        {/* Stock Tag */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs ${
                            stockQty > 5
                              ? 'bg-black/60 text-white backdrop-blur-md'
                              : stockQty > 0
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white'
                          }`}>
                            {stockQty === 0 ? 'Out of Stock' : `${stockQty} Units`}
                          </span>
                        </div>
                      </div>

                      {/* Product Content Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1.5">
                            {product.category?.name ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#F2E6DA] text-gray-800 text-[10px] font-extrabold border border-[#E8DACD]">
                                {product.category.name}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">Uncategorized</span>
                            )}
                            <span className="font-mono text-gray-400 text-[10px]">
                              SKU: {product.sku || 'N/A'}
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2" title={product.name}>
                            {product.name}
                          </h3>
                        </div>

                        {/* Specifications Bar */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-gray-500 bg-[#FAF5EF]/70 p-2 rounded-xl border border-[#E8DACD]">
                          <span>Color: <strong className="text-gray-900">{product.color || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Weight: <strong className="text-gray-900">{product.weight ? `${product.weight} kg` : 'N/A'}</strong></span>
                        </div>

                        <div className="flex items-baseline justify-between pt-2 border-t border-[#E8DACD]/50">
                          <div>
                            <div className="text-base font-black text-gray-900">
                              ₹{product.price}
                            </div>
                            {product.sale_price && (
                              <div className="text-xs text-rose-500 font-bold line-through">
                                ₹{product.sale_price}
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-semibold">
                            {formatDate(product.created_at || product.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Product Card Actions */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-[#E8DACD] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            title="View Product Details"
                            className="p-2 rounded-xl bg-white text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] border border-[#E8DACD] transition-all cursor-pointer shadow-2xs"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEditProduct(product.id)}
                            title="Edit Product Page"
                            className="p-2 rounded-xl bg-white text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] border border-[#E8DACD] transition-all cursor-pointer shadow-2xs"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(product)}
                            title="Delete Product"
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2E6DA] text-gray-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Product Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Specifications</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
                {!isLoading && products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-bold">
                      No products found matching your query.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isActive = product.status === 'active';
                    const imageUrl = getProductImageUrl(product);
                    const stockQty = product.inventory?.quantity ?? 0;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Product Info with Image */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-11 h-11 rounded-2xl object-cover border border-[#E8DACD] shrink-0 shadow-2xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] flex items-center justify-center font-black shrink-0 border border-[#FAF5EF]">
                                <FiBox className="w-5 h-5 text-[#88A626]" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap font-extrabold text-gray-900 leading-snug">
                                <span>{product.name}</span>
                                {(product.is_new_arrival || product.is_new) && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] uppercase">
                                    NEW
                                  </span>
                                )}
                                {(product.is_best_seller || product.is_bestseller) && (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase">
                                    BESTSELLER
                                  </span>
                                )}
                                {product.is_featured && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-[9px] uppercase">
                                    FEATURED
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 font-mono font-semibold">
                                SKU: {product.sku || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-gray-800">
                          {product.category?.name ? (
                            <span className="px-3 py-1 rounded-full bg-[#F2E6DA] text-gray-700 text-xs font-extrabold border border-[#E8DACD]">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Uncategorized</span>
                          )}
                        </td>

                        {/* Specifications */}
                        <td className="py-4 px-6 text-xs text-gray-600">
                          <div><span className="text-gray-400">Color:</span> <strong className="text-gray-900">{product.color || 'N/A'}</strong></div>
                          <div><span className="text-gray-400">Weight:</span> <strong className="text-gray-900">{product.weight ? `${product.weight} kg` : 'N/A'}</strong></div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-black text-gray-900">
                          ₹{product.price}
                          {product.sale_price && (
                            <span className="block text-[11px] text-rose-500 font-bold">
                              Sale: ₹{product.sale_price}
                            </span>
                          )}
                        </td>

                        {/* Stock Quantity */}
                        <td className="py-4 px-6 font-extrabold text-gray-800">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            stockQty > 5 ? 'bg-gray-100 text-gray-700' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {stockQty} units
                          </span>
                        </td>

                        {/* Clickable Status Badge */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(product)}
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
                          {formatDate(product.created_at || product.createdAt)}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewProduct(product.id)}
                              title="View Product Details"
                              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer shadow-2xs"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleEditProduct(product.id)}
                              title="Edit Product Page"
                              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer shadow-2xs"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(product)}
                              title="Delete Product"
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
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F2E6DA] flex items-center justify-between border-t border-[#E8DACD] text-xs font-bold text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} total products)
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

      {/* Confirm Delete Product Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, productId: null, productName: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Product"
        message={`Are you sure you want to delete product "${deleteModalState.productName}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Products;