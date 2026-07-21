import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiMessageSquare, 
  FiSearch, 
  FiFilter, 
  FiSend, 
  FiTrash2, 
  FiCheckCircle, 
  FiClock, 
  FiRefreshCw, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiUser,
  FiX,
  FiCornerDownRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const ContactSupport = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    openCount: 0,
    inProgressCount: 0,
    closedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reply Modal State
  const [replyModalState, setReplyModalState] = useState({
    isOpen: false,
    messageItem: null,
    adminReply: '',
    status: 'closed',
    isSubmitting: false
  });

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    messageId: null,
    customerName: '',
    isDeleting: false
  });

  // Fetch Messages from API
  const fetchMessages = useCallback(async (page = 1, search = '', status = 'all') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/contacts', {
        params: {
          page,
          limit: 10,
          search,
          status
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setMessages(responseData.data || []);
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
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to load contact support messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchMessages, currentPage, searchTerm, statusFilter]);

  // Open Reply Modal
  const openReplyModal = (msg) => {
    setReplyModalState({
      isOpen: true,
      messageItem: msg,
      adminReply: msg.admin_reply || '',
      status: msg.status || 'closed',
      isSubmitting: false
    });
  };

  // Submit Admin Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    const { messageItem, adminReply, status } = replyModalState;
    if (!messageItem) return;

    setReplyModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await ApiInstance.post(`/contacts/reply/${messageItem.id}`, {
        admin_reply: adminReply,
        status: status
      });

      if (res.data?.success) {
        toast.success(`Reply sent and status updated to ${status.toUpperCase()}`);
        setReplyModalState({ isOpen: false, messageItem: null, adminReply: '', status: 'closed', isSubmitting: false });
        fetchMessages(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Reply submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit reply');
      setReplyModalState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Open Delete Modal
  const openDeleteModal = (msgId, name) => {
    setDeleteModalState({
      isOpen: true,
      messageId: msgId,
      customerName: name || 'Customer',
      isDeleting: false
    });
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    const { messageId } = deleteModalState;
    if (!messageId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await ApiInstance.delete(`/contacts/delete/${messageId}`);
      if (res.data?.success) {
        toast.success('Support message deleted successfully');
        setDeleteModalState({ isOpen: false, messageId: null, customerName: '', isDeleting: false });
        fetchMessages(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete message');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Helper for Status Badge Styling
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'closed':
        return 'bg-[#BBF1D2]/50 text-[#1E7741] border-[#BBF1D2]';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'open':
      default:
        return 'bg-[#FFC5AA]/40 text-[#D96B3B] border-[#FFC5AA]';
    }
  };

  // Format Date Helper
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF9D9D]/20 text-[#2D252E]">
              <FiMessageSquare className="w-6 h-6 text-[#FF9D9D]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Contact Support & Inquiries
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Review incoming customer inquiries, send direct replies, and track resolution status.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Messages</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalMessages || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiMessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Open Inquiries */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Open Inquiries</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.openCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFC5AA]/30 text-[#D96B3B]">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.inProgressCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <FiRefreshCw className="w-5 h-5" />
          </div>
        </div>

        {/* Closed / Resolved */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Closed / Resolved</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.closedCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#BBF1D2]/40 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, subject..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF5F7] text-xs font-semibold text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#FAF5F7] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Messages</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed / Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#FF9D9D] text-xs">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Contact Messages...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5F7] text-gray-400 font-extrabold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Message Content</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {!isLoading && messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-bold">
                    No contact messages found matching your criteria.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name || 'User')}&background=FF9D9D&color=2D252E`;
                  
                  return (
                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={msg.name}
                            className="w-9 h-9 rounded-full border border-[#FF9D9D] shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-gray-900 text-xs">
                              {msg.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                              <FiMail className="w-3 h-3" />
                              <span>{msg.email}</span>
                            </p>
                            {msg.phone && (
                              <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                                <FiPhone className="w-3 h-3" />
                                <span>{msg.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6">
                        <span className="font-black text-gray-900 text-xs">
                          {msg.subject || 'General Inquiry'}
                        </span>
                      </td>

                      {/* Message Content */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <p className="text-xs text-gray-700 italic bg-[#FAF5F7] p-2.5 rounded-xl border border-gray-100 line-clamp-2 leading-relaxed">
                          "{msg.message}"
                        </p>
                        {msg.admin_reply && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#1E7741]">
                            <FiCornerDownRight className="w-3 h-3" />
                            <span>Replied</span>
                          </div>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-6 text-gray-400 text-xs font-semibold whitespace-nowrap">
                        {formatDate(msg.createdAt || msg.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(msg.status)}`}>
                          {msg.status ? msg.status.replace('_', ' ') : 'open'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReplyModal(msg)}
                            title="Reply & Manage Message"
                            className="p-2 rounded-xl bg-[#EEF8CD] text-[#2D252E] hover:bg-[#FF9D9D] transition-all cursor-pointer shadow-2xs font-bold text-xs flex items-center gap-1"
                          >
                            <FiSend className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>

                          <button
                            onClick={() => openDeleteModal(msg.id, msg.name)}
                            title="Delete Inquiry"
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
          <div className="px-6 py-4 bg-[#FAF5F7] flex items-center justify-between border-t border-gray-100 text-xs font-bold text-gray-500">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} total messages)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-white text-gray-800 font-black">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white text-gray-700 disabled:opacity-40 shadow-xs hover:bg-[#EEF8CD] hover:text-[#2D252E] transition-all cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply & Manage Message Modal */}
      {replyModalState.isOpen && replyModalState.messageItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EEF8CD] text-[#2D252E]">
                  <FiSend className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    Reply to Customer Inquiry
                  </h3>
                  <p className="text-xs font-semibold text-gray-400">
                    Message ID: #{replyModalState.messageItem.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReplyModalState({ isOpen: false, messageItem: null, adminReply: '', status: 'closed', isSubmitting: false })}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 rounded-2xl bg-[#FAF5F7] space-y-2 border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="font-extrabold text-gray-900 flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-[#FF9D9D]" />
                  <span>{replyModalState.messageItem.name}</span>
                </div>
                <div className="text-gray-500 font-semibold flex items-center gap-1">
                  <FiMail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{replyModalState.messageItem.email}</span>
                </div>
                {replyModalState.messageItem.phone && (
                  <div className="text-gray-500 font-semibold flex items-center gap-1">
                    <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{replyModalState.messageItem.phone}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-black text-[#FF9D9D] pt-1">
                Subject: {replyModalState.messageItem.subject || 'General Inquiry'}
              </p>
            </div>

            {/* Customer Original Message */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Customer Message
              </label>
              <div className="p-4 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-line border border-gray-200">
                "{replyModalState.messageItem.message}"
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-5">
              {/* Admin Reply Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Admin Reply Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Type your response to the customer..."
                  value={replyModalState.adminReply}
                  onChange={(e) => setReplyModalState((prev) => ({ ...prev, adminReply: e.target.value }))}
                  className="w-full p-4 rounded-2xl bg-[#FAF5F7] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] transition-all resize-y"
                />
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Update Ticket Status
                </label>
                <select
                  value={replyModalState.status}
                  onChange={(e) => setReplyModalState((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 rounded-2xl bg-[#FAF5F7] text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF9D9D] cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed / Resolved</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReplyModalState({ isOpen: false, messageItem: null, adminReply: '', status: 'closed', isSubmitting: false })}
                  className="py-3 px-5 rounded-2xl bg-[#FAF5F7] text-xs font-black text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={replyModalState.isSubmitting}
                  className="btn-primary py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
                >
                  {replyModalState.isSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Send Reply & Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, messageId: null, customerName: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Support Inquiry"
        message={`Are you sure you want to delete the inquiry message from "${deleteModalState.customerName}"?`}
        confirmText="Delete Message"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ContactSupport;