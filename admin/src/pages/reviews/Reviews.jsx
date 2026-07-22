import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiStar, 
  FiSearch, 
  FiFilter, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiBox,
  FiUser,
  FiMessageSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: '0.0',
    pendingCount: 0,
    approvedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    reviewId: null,
    productName: '',
    isDeleting: false
  });

  // Fetch Reviews from API
  const fetchReviews = useCallback(async (page = 1, search = '', status = 'all', rating = 'all') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/reviews', {
        params: {
          page,
          limit: 10,
          search,
          status,
          rating
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setReviews(responseData.data || []);
        if (responseData.stats) {
          setStats(responseData.stats);
        }
        if (responseData.meta) {
          setTotalItems(responseData.meta.totalItems || 0);
          setTotalPages(responseData.meta.totalPages || 1);
          setCurrentPage(responseData.meta.currentPage || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load product reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(currentPage, searchTerm, statusFilter, ratingFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchReviews, currentPage, searchTerm, statusFilter, ratingFilter]);

  // Handle Review Status Change (Approve / Reject / Pending)
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const res = await ApiInstance.put(`/reviews/${reviewId}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Review status changed to ${newStatus.toUpperCase()}`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        fetchReviews(currentPage, searchTerm, statusFilter, ratingFilter);
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update review status');
    }
  };

  // Open Delete Review Modal
  const openDeleteModal = (reviewId, productName) => {
    setDeleteModalState({
      isOpen: true,
      reviewId,
      productName: productName || 'Product',
      isDeleting: false
    });
  };

  // Confirm Delete Review Action
  const handleConfirmDelete = async () => {
    const { reviewId } = deleteModalState;
    if (!reviewId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await ApiInstance.delete(`/reviews/delete/${reviewId}`);
      if (res.data?.success) {
        toast.success('Review deleted successfully');
        setDeleteModalState({ isOpen: false, reviewId: null, productName: '', isDeleting: false });
        fetchReviews(currentPage, searchTerm, statusFilter, ratingFilter);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Render Star Rating Stars
  const renderStars = (rating) => {
    const numRating = Math.min(Math.max(Number(rating) || 0, 1), 5);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= numRating 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-200'
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-black text-gray-800">{numRating}.0</span>
      </div>
    );
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Status Badge Colors Helper
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-[#E8DACD]/50 text-[#1E7741] border-[#E8DACD]';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#5F0917]/50 text-[#D96B3B] border-[#5F0917]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A0C1E]/20 text-[#2B1B17]">
              <FiStar className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Product Reviews & Ratings
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Monitor product reviews, manage ratings, and moderate customer feedback.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalReviews || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiMessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Rating */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-1.5">
              <span>{stats.avgRating || '0.0'}</span>
              <FiStar className="w-5 h-5 fill-amber-400 text-amber-400" />
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
            <FiStar className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Moderation</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.pendingCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#5F0917]/30 text-[#D96B3B]">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Approved Reviews</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.approvedCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/40 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by review text or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F2E6DA] text-xs font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Rating Filter */}
          <div className="flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-xs">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Product Reviews...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2E6DA] text-gray-400 font-extrabold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Review Feedback</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status (Action)</th>
                <th className="py-4 px-6 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
              {!isLoading && reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-bold">
                    No product reviews found matching your query.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const currentStatus = rev.status || 'pending';
                  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'User')}&background=FF9D9D&color=2D252E`;
                  
                  return (
                    <tr key={rev.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 max-w-[180px]">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-[#E8DACD] overflow-hidden">
                            {rev.product?.thumbnail_img ? (
                              <img src={rev.product.thumbnail_img} alt={rev.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <FiBox className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-gray-900 truncate">
                              {rev.product?.name || `Product #${rev.product_id}`}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase truncate">
                              ID: #{rev.product_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={userAvatar}
                            alt={rev.user?.name || 'User'}
                            className="w-8 h-8 rounded-full border border-[#7A0C1E]"
                          />
                          <div>
                            <p className="font-extrabold text-gray-900 text-xs">
                              {rev.user?.name || 'Anonymous User'}
                            </p>
                            <p className="text-[11px] text-gray-400 font-semibold">{rev.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Star Rating Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {renderStars(rev.rating)}
                      </td>

                      {/* Review Text Feedback Column */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <p className="text-xs text-gray-700 italic bg-[#F2E6DA] p-2.5 rounded-xl border border-[#E8DACD] line-clamp-3 leading-relaxed">
                          "{rev.review || 'No written review text provided.'}"
                        </p>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-gray-400 text-xs font-semibold whitespace-nowrap">
                        {formatDate(rev.createdAt || rev.created_at)}
                      </td>

                      {/* Status Dropdown / Action */}
                      <td className="py-4 px-6">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(rev.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide border uppercase focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer transition-all ${getStatusBadgeStyle(currentStatus)}`}
                        >
                          <option value="approved" className="bg-white text-gray-800">Approved</option>
                          <option value="pending" className="bg-white text-gray-800">Pending</option>
                          <option value="rejected" className="bg-white text-gray-800">Rejected</option>
                        </select>
                      </td>

                      {/* Action Delete */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openDeleteModal(rev.id, rev.product?.name)}
                          title="Delete Review"
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
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
              Showing page {currentPage} of {totalPages} ({totalItems} total reviews)
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, reviewId: null, productName: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Customer Review"
        message={`Are you sure you want to delete this review for "${deleteModalState.productName}"? This action cannot be undone.`}
        confirmText="Delete Review"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Reviews;