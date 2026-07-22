import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHelpCircle, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiChevronDown, 
  FiChevronUp,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiGrid
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const FAQs = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    faqId: null,
    faqQuestion: '',
    isDeleting: false
  });

  // Fetch FAQs from API
  const fetchFAQs = useCallback(async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/faqs', {
        params: {
          page,
          limit: 10,
          search
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setFaqs(responseData.data || []);
        if (responseData.meta) {
          setTotalItems(responseData.meta.totalItems || 0);
          setTotalPages(responseData.meta.totalPages || 1);
          setCurrentPage(responseData.meta.currentPage || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFAQs(currentPage, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchFAQs, currentPage, searchTerm]);

  // Handle Inline Status Toggle (Active / Inactive)
  const handleStatusToggle = async (faqId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await ApiInstance.put(`/faqs/update/${faqId}`, { status: newStatus });
      if (response.data?.success) {
        toast.success(`FAQ status updated to ${newStatus.toUpperCase()}`);
        setFaqs((prev) =>
          prev.map((f) => (f.id === faqId ? { ...f, status: newStatus } : f))
        );
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update FAQ status');
    }
  };

  // Open Delete Modal
  const openDeleteModal = (faqId, question) => {
    setDeleteModalState({
      isOpen: true,
      faqId,
      faqQuestion: question || 'FAQ',
      isDeleting: false
    });
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    const { faqId } = deleteModalState;
    if (!faqId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/faqs/delete/${faqId}`);
      if (response.data?.success) {
        toast.success('FAQ deleted successfully');
        setDeleteModalState({ isOpen: false, faqId: null, faqQuestion: '', isDeleting: false });
        fetchFAQs(currentPage, searchTerm);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete FAQ');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Get Unique Categories List
  const uniqueCategories = Array.from(
    new Set(faqs.map((f) => f.category).filter(Boolean))
  );

  // Filtered FAQs by Category
  const filteredFaqs = categoryFilter === 'all' 
    ? faqs 
    : faqs.filter((f) => f.category?.toLowerCase() === categoryFilter.toLowerCase());

  // Statistics
  const activeCount = faqs.filter((f) => f.status === 'active').length;
  const inactiveCount = faqs.filter((f) => f.status === 'inactive').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A0C1E]/20 text-[#2B1B17]">
              <FiHelpCircle className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Create, edit, and organize helpful answers for customer inquiries.
          </p>
        </div>

        <button
          onClick={() => navigate('/faqs/add')}
          className="btn-primary py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total FAQs */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total FAQs</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalItems}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiHelpCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Active FAQs */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{activeCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/40 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive FAQs */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{inactiveCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categories</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{uniqueCategories.length || 1}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#5F0917]/30 text-[#D96B3B]">
            <FiGrid className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E8DACD] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F2E6DA] text-xs font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#F2E6DA] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FAQs List Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative p-6">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-xs">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading FAQs...</span>
            </div>
          </div>
        )}

        <div className="space-y-4 min-h-[350px]">
          {!isLoading && filteredFaqs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 font-bold space-y-2">
              <FiHelpCircle className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm">No FAQs found matching your criteria.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              const isActive = faq.status === 'active';

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'border-[#7A0C1E] bg-[#F2E6DA]/50 shadow-xs'
                      : 'border-[#E8DACD] bg-white hover:border-[#E8DACD]'
                  }`}
                >
                  {/* Item Accordion Header */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 text-gray-400">
                        {isExpanded ? <FiChevronUp className="w-5 h-5 text-[#7A0C1E]" /> : <FiChevronDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm leading-snug">
                          {faq.question}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {faq.category && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF5EF] text-[#2B1B17]">
                              {faq.category}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 font-semibold">
                            Order: {faq.sort_order ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons & Status Toggle */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Active/Inactive Status Toggle */}
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(faq.id, faq.status)}
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#E8DACD]/60 text-[#1E7741] border-[#E8DACD]'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {faq.status || 'active'}
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => navigate(`/faqs/${faq.id}`)}
                        title="View FAQ Details"
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/faqs/edit/${faq.id}`)}
                        title="Edit FAQ"
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#5F0917]/40 hover:text-[#2B1B17] transition-all cursor-pointer"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => openDeleteModal(faq.id, faq.question)}
                        title="Delete FAQ"
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Accordion Content Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#E8DACD]/80 text-xs text-gray-700 font-medium leading-relaxed bg-white/70">
                      <p className="whitespace-pre-line text-gray-800">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-[#E8DACD] flex items-center justify-between text-xs font-bold text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} FAQs)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-black">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-all cursor-pointer"
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
        onClose={() => setDeleteModalState({ isOpen: false, faqId: null, faqQuestion: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete FAQ"
        message={`Are you sure you want to delete FAQ "${deleteModalState.faqQuestion}"?`}
        confirmText="Delete FAQ"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default FAQs;