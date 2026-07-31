import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiShoppingBag, 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiTruck, 
  FiClock, 
  FiLoader,
  FiSave,
  FiMail,
  FiPhone,
  FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const GetOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Fetch Order Details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await ApiInstance.get(`/orders/${id}`);
        if (response.data?.success) {
          const orderData = response.data.data;
          setOrder(orderData);
          setSelectedStatus(orderData.status || 'pending');
          setSelectedPaymentStatus(orderData.payment_status || 'pending');
        }
      } catch (error) {
        console.error('Error loading order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Update Status Submit
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await ApiInstance.put(`/orders/update-status/${id}`, {
        status: selectedStatus,
        payment_status: selectedPaymentStatus
      });

      if (response.data?.success) {
        toast.success('Order status updated successfully!');
        setOrder((prev) => ({
          ...prev,
          status: selectedStatus,
          payment_status: selectedPaymentStatus
        }));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading Order Information...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DACD] p-8 space-y-4">
        <h3 className="text-lg font-black text-gray-800">Order Not Found</h3>
        <p className="text-xs font-semibold text-gray-400">The requested order ID does not exist.</p>
        <button
          onClick={() => navigate('/orders')}
          className="py-2.5 px-6 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-black"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const user = order.user || order.user_id || {};
  const address = order.address || order.address_id || {};
  const items = order.items || [];

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const formatImageUrl = (imgPath) => {
    if (!imgPath || typeof imgPath !== 'string') return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    return `${backendUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const addressLine1 = address.address_line1 || address.address_line_1 || address.address || address.street || '';
  const addressLine2 = address.address_line2 || address.address_line_2 || address.landmark || '';
  const recipientName = address.full_name || address.name || user.name || 'Valued Customer';
  const recipientPhone = address.phone || user.phone || 'N/A';
  const city = address.city || '';
  const state = address.state || '';
  const pincode = address.pincode || address.pinCode || address.zipCode || '';
  const label = address.label || address.type || 'HOME';

  const discountVal = parseFloat(order.discount || order.discount_amount || 0);
  const taxVal = parseFloat(order.tax || order.tax_amount || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-3 rounded-2xl bg-white border border-[#E8DACD] text-gray-700 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] transition-all cursor-pointer shadow-2xs"
            title="Back to Orders"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Order #{order.order_number || order.id}
              </h2>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF5EF] text-[#5F0917] border border-[#E8DACD]">
                {order.status || 'pending'}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Placed on {new Date(order.createdAt || order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Summary Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Information */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD] space-y-4">
          <div className="flex items-center gap-3 text-gray-900 font-extrabold text-sm pb-3 border-b border-[#E8DACD]">
            <FiUser className="w-4 h-4 text-[#7A0C1E]" />
            <span>Customer Details</span>
          </div>
          <div className="space-y-2 text-xs">
            <p className="font-black text-gray-900 text-sm">{user.name || recipientName}</p>
            <p className="text-gray-500 font-semibold flex items-center gap-2">
              <FiMail className="w-3.5 h-3.5 text-gray-400" />
              <span>{user.email || 'No Email Registered'}</span>
            </p>
            <p className="text-gray-500 font-semibold flex items-center gap-2">
              <FiPhone className="w-3.5 h-3.5 text-gray-400" />
              <span>{recipientPhone}</span>
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DACD]">
            <div className="flex items-center gap-3 text-gray-900 font-extrabold text-sm">
              <FiMapPin className="w-4 h-4 text-[#7A0C1E]" />
              <span>Shipping Address</span>
            </div>
            {label && (
              <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD]">
                {label}
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-gray-700 font-semibold leading-relaxed">
            {addressLine1 || recipientName ? (
              <>
                <p className="font-bold text-gray-900 text-sm">{recipientName}</p>
                {addressLine1 && <p>{addressLine1}</p>}
                {addressLine2 && <p>{addressLine2}</p>}
                {(city || state || pincode) && (
                  <p>{city}{city && state ? ', ' : ''}{state}{pincode ? ` - ${pincode}` : ''}</p>
                )}
                <p className="text-gray-400 text-[11px] pt-1">Phone: {recipientPhone}</p>
              </>
            ) : (
              <p className="text-gray-400 italic">No specific address record attached.</p>
            )}
          </div>
        </div>

        {/* Payment & Order Status Changer */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD] space-y-4">
          <div className="flex items-center gap-3 text-gray-900 font-extrabold text-sm pb-3 border-b border-[#E8DACD]">
            <FiCreditCard className="w-4 h-4 text-[#7A0C1E]" />
            <span>Payment & Status</span>
          </div>

          <form onSubmit={handleUpdateStatus} className="space-y-3">
            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                Order Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#FAF5EF] text-xs font-black text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                Payment Status ({order.payment_method ? order.payment_method.toUpperCase() : 'COD'})
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#FAF5EF] text-xs font-black text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs mt-2"
            >
              {isUpdating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8DACD]">
          <FiPackage className="w-5 h-5 text-[#7A0C1E]" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Ordered Products ({items.length} Items)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EF] text-[#7A0C1E] font-extrabold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DACD]/60 font-medium text-gray-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400 font-bold">
                    No items found for this order.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const productObj = item.product_id && typeof item.product_id === 'object' ? item.product_id : (item.product || {});
                  const productTitle = item.product_name || productObj.name || item.name || 'Product Item';
                  const price = parseFloat(item.price || productObj.price || 0);
                  const qty = item.quantity || 1;
                  const total = item.total ? parseFloat(item.total) : price * qty;

                  let rawImg = item.image || productObj.image || productObj.image_url;
                  if (!rawImg && Array.isArray(productObj.images) && productObj.images.length > 0) {
                    rawImg = productObj.images[0]?.url || productObj.images[0];
                  }
                  const formattedImg = formatImageUrl(rawImg);

                  const rawTarget = productObj._id || productObj.id || (typeof item.product_id === 'string' ? item.product_id : null);
                  const targetProductId = rawTarget ? String(rawTarget) : null;

                  return (
                    <tr key={idx} className="hover:bg-[#FAF5EF]/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-3">
                        {formattedImg ? (
                          <img
                            src={formattedImg}
                            alt={productTitle}
                            onClick={() => targetProductId && navigate(`/products/${targetProductId}`)}
                            className={`w-12 h-12 object-cover rounded-xl border border-[#E8DACD] ${targetProductId ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            onClick={() => targetProductId && navigate(`/products/${targetProductId}`)}
                            className={`w-12 h-12 bg-[#FAF5EF] rounded-xl border border-[#E8DACD] flex items-center justify-center text-gray-400 shrink-0 ${targetProductId ? 'cursor-pointer hover:bg-[#E8DACD]/50 transition-colors' : ''}`}
                          >
                            <FiPackage className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          {targetProductId ? (
                            <button
                              onClick={() => navigate(`/products/${targetProductId}`)}
                              className="font-extrabold text-[#2B1B17] hover:text-[#7A0C1E] text-xs sm:text-sm text-left hover:underline cursor-pointer transition-colors block"
                            >
                              {productTitle}
                            </button>
                          ) : (
                            <p className="font-extrabold text-[#2B1B17] text-xs sm:text-sm">{productTitle}</p>
                          )}
                          {item.product_sku && (
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {item.product_sku}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-600">
                        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800">
                        x{qty}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-gray-900">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Order Totals Summary */}
        <div className="pt-4 border-t border-[#E8DACD] flex justify-end">
          <div className="w-full sm:w-80 bg-[#FAF5EF]/50 border border-[#E8DACD] p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between text-gray-600 font-semibold">
              <span>Subtotal:</span>
              <span>₹{parseFloat(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {discountVal > 0 && (
              <div className="flex items-center justify-between text-[#1E7741] font-semibold">
                <span>Coupon Discount:</span>
                <span>-₹{discountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {taxVal > 0 && (
              <div className="flex items-center justify-between text-gray-600 font-semibold">
                <span>Tax:</span>
                <span>+₹{taxVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-gray-600 font-semibold">
              <span>Shipping Charge:</span>
              <span>
                {parseFloat(order.shipping_charge || 0) > 0
                  ? `₹${parseFloat(order.shipping_charge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-900 font-black text-sm pt-2 border-t border-[#E8DACD]">
              <span>Grand Total:</span>
              <span className="text-[#7A0C1E]">₹{parseFloat(order.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetOrder;
