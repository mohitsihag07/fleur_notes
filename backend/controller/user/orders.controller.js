const db = require("../../models");
const helper = require("../../helper/helper");
const { Order, OrderItem, ProductImage } = db;

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user_id: userId })
      .populate('address_id')
      .sort({ created_at: -1 })
      .lean();

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).lean();

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
          let img = item.image;
          if (!img && item.product_id) {
            const pImg = await ProductImage.findOne({ product_id: item.product_id })
              .sort({ is_thumbnail: -1, sort_order: 1 })
              .lean();
            if (pImg) img = pImg.image || pImg.image_url;
          }
          return {
            name: item.product_name || 'Product',
            quantity: item.quantity,
            price: item.price,
            total: item.total || (item.price * item.quantity),
            image: img
          };
        }));

        const primaryProduct = itemsWithDetails[0] || {};
        const primaryImage = primaryProduct.image || null;

        return {
          id: order.order_number || `FN-${order._id.toString().slice(-4).toUpperCase()}`,
          rawId: order._id,
          orderNumber: order.order_number,
          date: new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          total: `₹${Number(order.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          rawTotal: order.grand_total,
          subtotal: order.subtotal,
          discount: order.discount || order.discount_amount || 0,
          tax: order.tax || order.tax_amount || 0,
          shippingCharge: order.shipping_charge || 0,
          itemsCount: `${items.length} ${items.length === 1 ? 'item' : 'items'}`,
          status: (order.status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          rawStatus: order.status || 'pending',
          paymentStatus: order.payment_status || 'pending',
          paymentMethod: order.payment_method || 'COD',
          statusClass: getStatusBadgeClass(order.status),
          image: primaryImage,
          primaryProductName: primaryProduct.name || 'Product Item',
          address: order.address_id || null,
          items: itemsWithDetails
        };
      })
    );

    return helper.success(res, "User orders retrieved successfully", formattedOrders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return helper.error(res, "Failed to retrieve user orders", 500);
  }
};

function getStatusBadgeClass(status) {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'shipped':
    case 'out_for_delivery':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-700';
    case 'return_requested':
      return 'bg-[#F2E6DA] text-[#7A0C1E] border border-[#E8DACD]';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

const getUserOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    let query = { user_id: userId };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [{ _id: id }, { order_number: id }];
    } else {
      query.order_number = id;
    }

    const order = await Order.findOne(query).populate('address_id').lean();
    if (!order) {
      return helper.error(res, "Order not found", 404);
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();
    const itemsWithDetails = await Promise.all(items.map(async (item) => {
      let img = item.image;
      if (!img && item.product_id) {
        const pImg = await ProductImage.findOne({ product_id: item.product_id })
          .sort({ is_thumbnail: -1, sort_order: 1 })
          .lean();
        if (pImg) img = pImg.image || pImg.image_url;
      }
      return {
        productId: item.product_id,
        name: item.product_name || 'Product',
        quantity: item.quantity,
        price: item.price,
        total: item.total || (item.price * item.quantity),
        image: img
      };
    }));

    const primaryProduct = itemsWithDetails[0] || {};

    const formattedOrder = {
      id: order.order_number || `FN-${order._id.toString().slice(-4).toUpperCase()}`,
      rawId: order._id,
      orderNumber: order.order_number,
      date: new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      total: `₹${Number(order.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      rawTotal: order.grand_total,
      subtotal: order.subtotal,
      discount: order.discount || order.discount_amount || 0,
      tax: order.tax || order.tax_amount || 0,
      shippingCharge: order.shipping_charge || 0,
      itemsCount: `${items.length} ${items.length === 1 ? 'item' : 'items'}`,
      status: (order.status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      rawStatus: order.status || 'pending',
      paymentStatus: order.payment_status || 'pending',
      paymentMethod: order.payment_method || 'COD',
      statusClass: getStatusBadgeClass(order.status),
      image: primaryProduct.image || null,
      primaryProductName: primaryProduct.name || 'Product Item',
      address: order.address_id || null,
      items: itemsWithDetails,
      returnType: order.return_type,
      returnReason: order.return_reason,
      returnNotes: order.return_notes,
      returnRequestedAt: order.return_requested_at ? new Date(order.return_requested_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : null
    };

    return helper.success(res, "Order details retrieved successfully", formattedOrder);
  } catch (error) {
    console.error("Get User Order By ID Error:", error);
    return helper.error(res, "Failed to retrieve order details", 500);
  }
};

const requestOrderReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { return_type = 'return', return_reason, return_notes } = req.body;

    let query = { user_id: userId };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [{ _id: id }, { order_number: id }];
    } else {
      query.order_number = id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return helper.error(res, "Order not found", 404);
    }

    if (order.status !== 'delivered') {
      return helper.error(res, "Only delivered orders can be requested for return or exchange.", 400);
    }

    order.status = 'return_requested';
    order.return_type = return_type;
    order.return_reason = return_reason || 'Customer Return/Exchange Request';
    order.return_notes = return_notes || null;
    order.return_requested_at = new Date();
    await order.save();

    return helper.success(res, "Return/Exchange request submitted successfully", {
      orderId: order._id,
      orderNumber: order.order_number,
      status: order.status,
      returnType: order.return_type
    });
  } catch (error) {
    console.error("Request Order Return Error:", error);
    return helper.error(res, "Failed to process return request", 500);
  }
};

module.exports = {
  getUserOrders,
  getUserOrderById,
  requestOrderReturn
};
