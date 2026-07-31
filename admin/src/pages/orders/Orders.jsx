import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiSearch,
  FiFilter,
  FiEye,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiDollarSign,
  FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingCount: 0,
    processingCount: 0,
    deliveredCount: 0,
    totalRevenue: '0.00'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch Orders List from Backend API
  const fetchOrders = useCallback(async (page = 1, search = '', status = 'all') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/orders', {
        params: {
          page,
          limit: 10,
          search,
          status
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setOrders(responseData.data || []);
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
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(currentPage, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchOrders, currentPage, searchTerm, statusFilter]);

  // Update Order Status inline
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await ApiInstance.put(`/orders/update-status/${orderId}`, {
        status: newStatus
      });

      if (res.data?.success) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
        fetchOrders(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Order status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Helper for Order Status Badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-[#FAF5EF] text-[#5F0917] border-[#E8DACD]';
      case 'shipped':
      case 'out_for_delivery':
      case 'confirmed':
      case 'packed':
        return 'bg-[#FAF5EF] text-[#7A0C1E] border-[#E8DACD]';
      case 'cancelled':
      case 'returned':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#F2E6DA]/40 text-[#7A0C1E] border-[#E8DACD]';
    }
  };

  // Helper for Payment Status Badge styling
  const getPaymentBadgeStyle = (pStatus) => {
    switch (pStatus?.toLowerCase()) {
      case 'paid':
        return 'bg-[#FAF5EF] text-[#5F0917] font-black border border-[#E8DACD]';
      case 'failed':
      case 'refunded':
        return 'bg-red-50 text-red-600 font-bold';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 font-bold';
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const formatImageUrl = (imgPath) => {
    if (!imgPath || typeof imgPath !== 'string') return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    return `${backendUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD]">
              <FiShoppingBag className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Orders Management
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Track customer purchases, update order fulfillment progress, and manage payment statuses.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalOrders || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
            <FiShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.pendingCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#F2E6DA]/40 text-[#7A0C1E]">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        {/* In Transit / Processing */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Processing & Shipped</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.processingCount || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#A87B39]">
            <FiTruck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Revenue (Rupee Sign) */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">₹{parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#5F0917]">
            <span className="font-black text-lg">₹</span>
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
            placeholder="Search order # or payment status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF5EF] text-xs font-semibold text-gray-700 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#FAF5EF] px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 border border-[#E8DACD]">
            <FiFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Order Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none font-black text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-xs">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Loading Orders Data...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EF] text-[#7A0C1E] font-extrabold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Order ID & Date</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Grand Total</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Order Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DACD]/60 font-medium text-gray-700">
              {!isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 font-bold">
                    No customer orders found matching your filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const targetId = order._id || order.id;
                  const customerName = order.user?.name || 'Guest Customer';
                  const customerEmail = order.user?.email || 'N/A';
                  const items = order.items || [];

                  return (
                    <tr key={targetId} className="hover:bg-[#FAF5EF]/40 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-black text-xs text-gray-900 block">
                          #{order.order_number || `ORD-${targetId}`}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {formatDate(order.createdAt || order.created_at)}
                        </span>
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="py-4 px-6">
                        {items.length > 0 ? (
                          (() => {
                            const firstItem = items[0];
                            const pObj = firstItem.product_id && typeof firstItem.product_id === 'object' ? firstItem.product_id : {};
                            const title = firstItem.product_name || pObj.name || firstItem.name || 'Product';
                            let rawImg = firstItem.image || pObj.image || pObj.image_url;
                            if (!rawImg && Array.isArray(pObj.images) && pObj.images.length > 0) {
                              rawImg = pObj.images[0]?.url || pObj.images[0];
                            }
                            const imgUrl = formatImageUrl(rawImg);

                            return (
                              <div className="flex items-center gap-2.5">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={title}
                                    className="w-10 h-10 object-cover rounded-xl border border-[#E8DACD] shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-[#FAF5EF] rounded-xl border border-[#E8DACD] flex items-center justify-center text-gray-400 shrink-0">
                                    <FiPackage className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-extrabold text-gray-900 text-xs truncate max-w-[140px]" title={title}>
                                    {title}
                                  </p>
                                  {items.length > 1 && (
                                    <span className="text-[10px] font-bold text-[#7A0C1E] block">
                                      +{items.length - 1} more item{items.length - 1 > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No items</span>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-gray-900 text-xs">
                          {customerName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-semibold">
                          {customerEmail}
                        </p>
                      </td>

                      {/* Grand Total with Rupee Sign */}
                      <td className="py-4 px-6">
                        <span className="font-black text-gray-900 text-sm">
                          ₹{parseFloat(order.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${getPaymentBadgeStyle(order.payment_status)}`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>

                      {/* Order Status Select */}
                      <td className="py-4 px-6">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(targetId, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer focus:outline-none ${getStatusBadgeStyle(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* View Action - Only Eye Icon */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => navigate(`/orders/${targetId}`)}
                          title="View Order Details"
                          className="w-9 h-9 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer shadow-2xs font-bold inline-flex items-center justify-center border border-[#E8DACD]/80 hover:border-[#7A0C1E]"
                        >
                          <FiEye className="w-4 h-4" />
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
          <div className="px-6 py-4 bg-[#FAF5EF] flex items-center justify-between border-t border-[#E8DACD] text-xs font-bold text-gray-600">
            <span>
              Showing page {currentPage} of {totalPages} ({totalItems} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white text-gray-700 border border-[#E8DACD] disabled:opacity-40 shadow-xs hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#7A0C1E] text-white font-black">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white text-gray-700 border border-[#E8DACD] disabled:opacity-40 shadow-xs hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
