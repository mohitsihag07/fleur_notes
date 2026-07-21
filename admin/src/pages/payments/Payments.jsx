import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCreditCard, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiRotateCcw, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiX,
  FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalReceived: '0.00',
    totalRefunded: '0.00',
    paidCount: 0,
    pendingCount: 0,
    refundedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Refund Modal State
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    paymentItem: null,
    refundAmount: '',
    isSubmitting: false
  });

  // Fetch Payments from API
  const fetchPayments = useCallback(async (page = 1, search = '', status = 'all') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/payments', {
        params: {
          page,
          limit: 10,
          search,
          status: status === 'all' ? '' : status
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setPayments(responseData.data || []);
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
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment transactions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPayments, currentPage, searchTerm, statusFilter]);

  // Open Refund Modal
  const openRefundModal = (payment) => {
    setRefundModal({
      isOpen: true,
      paymentItem: payment,
      refundAmount: payment.amount || '',
      isSubmitting: false
    });
  };

  // Submit Refund
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    const { paymentItem, refundAmount } = refundModal;
    if (!paymentItem || !refundAmount) return;

    setRefundModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const response = await ApiInstance.post(`/payments/refund/${paymentItem.id}`, {
        amount: parseFloat(refundAmount)
      });

      if (response.data?.success) {
        toast.success(`Successfully processed refund of ₹${parseFloat(refundAmount).toFixed(2)}`);
        setRefundModal({ isOpen: false, paymentItem: null, refundAmount: '', isSubmitting: false });
        fetchPayments(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Refund processing error:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
      setRefundModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Helper for Payment Gateway badge
  const getGatewayBadge = (gateway) => {
    switch (gateway?.toLowerCase()) {
      case 'stripe':
        return <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase border border-indigo-100">Stripe</span>;
      case 'razorpay':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase border border-blue-100">Razorpay</span>;
      case 'paypal':
        return <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-extrabold text-[10px] uppercase border border-sky-100">PayPal</span>;
      case 'cod':
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase border border-amber-100">Cash on Delivery</span>;
    }
  };

  // Helper for Status Badge
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-[#BBF1D2]/50 text-[#1E7741] border-[#BBF1D2]';
      case 'refunded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#FFC5AA]/40 text-[#D96B3B] border-[#FFC5AA]';
    }
  };

  // Date Formatter Helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF9D9D]/20 text-[#2D252E]">
              <FiCreditCard className="w-6 h-6 text-[#FF9D9D]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Payments & Transactions
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Track customer payments, view gateway transaction logs, and manage refunds.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Received */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Received</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              ₹{parseFloat(stats.totalReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#BBF1D2]/40 text-[#1E7741]">
            <span className="font-black text-lg">₹</span>
          </div>
        </div>

        {/* Total Refunded */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Refunded</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              ₹{parseFloat(stats.totalRefunded || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-red-50 text-red-600">
            <FiRotateCcw className="w-5 h-5" />
          </div>
        </div>

        {/* Paid Transactions */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paid Transactions</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.paidCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#EEF8CD] text-[#2D252E]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Payments</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.pendingCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFC5AA]/30 text-[#D96B3B]">
            <FiClock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, gateway..."
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
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#FF9D9D] text-xs">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Payments & Transactions...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5F7] text-gray-400 font-extrabold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Order & Customer</th>
                <th className="py-4 px-6">Gateway</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {!isLoading && payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-bold">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const orderNum = payment.order?.order_number || `ORD-${payment.order_id}`;
                  const customerName = payment.order?.user?.name || 'Guest User';

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-4 px-6 font-mono font-extrabold text-xs text-gray-900">
                        {payment.transaction_id || `TXN-${payment.id}`}
                      </td>

                      {/* Order & Customer */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/orders/${payment.order_id}`)}
                          className="font-black text-[#FF9D9D] hover:underline block text-xs"
                        >
                          #{orderNum}
                        </button>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {customerName}
                        </span>
                      </td>

                      {/* Gateway */}
                      <td className="py-4 px-6">
                        {getGatewayBadge(payment.gateway)}
                      </td>

                      {/* Amount with Rupee Sign */}
                      <td className="py-4 px-6">
                        <span className="font-black text-gray-900 text-sm">
                          ₹{parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {payment.refund_amount > 0 && (
                          <span className="block text-[10px] font-bold text-red-500">
                            Refunded: ₹{parseFloat(payment.refund_amount).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-gray-400 text-xs font-semibold whitespace-nowrap">
                        {formatDate(payment.paid_at || payment.createdAt || payment.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(payment.status)}`}>
                          {payment.status || 'pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/orders/${payment.order_id}`)}
                            title="View Associated Order"
                            className="p-2.5 rounded-2xl bg-[#EEF8CD] text-[#2D252E] hover:bg-[#FF9D9D] transition-all cursor-pointer shadow-2xs font-bold text-xs flex items-center gap-1"
                          >
                            <FiShoppingBag className="w-3.5 h-3.5" />
                            <span>Order</span>
                          </button>

                          {payment.status === 'paid' && (
                            <button
                              onClick={() => openRefundModal(payment)}
                              title="Process Refund"
                              className="p-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs font-bold text-xs flex items-center gap-1"
                            >
                              <FiRotateCcw className="w-3.5 h-3.5" />
                              <span>Refund</span>
                            </button>
                          )}
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
              Showing page {currentPage} of {totalPages} ({totalItems} total transactions)
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

      {/* Refund Modal */}
      {refundModal.isOpen && refundModal.paymentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-100 text-red-600">
                  <FiRotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Process Refund</h3>
                  <p className="text-xs font-semibold text-gray-400">Payment #{refundModal.paymentItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRefundModal({ isOpen: false, paymentItem: null, refundAmount: '', isSubmitting: false })}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF5F7] text-xs space-y-1.5 border border-gray-100">
                <div className="flex justify-between font-extrabold text-gray-800">
                  <span>Transaction Amount:</span>
                  <span>₹{parseFloat(refundModal.paymentItem.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Gateway:</span>
                  <span className="uppercase font-bold">{refundModal.paymentItem.gateway}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={refundModal.paymentItem.amount}
                  value={refundModal.refundAmount}
                  onChange={(e) => setRefundModal((prev) => ({ ...prev, refundAmount: e.target.value }))}
                  className="w-full p-3.5 rounded-2xl bg-[#FAF5F7] text-xs font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRefundModal({ isOpen: false, paymentItem: null, refundAmount: '', isSubmitting: false })}
                  className="py-3 px-5 rounded-2xl bg-[#FAF5F7] text-xs font-black text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundModal.isSubmitting}
                  className="py-3 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                >
                  {refundModal.isSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FiRotateCcw className="w-4 h-4" />
                      <span>Confirm Refund</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;