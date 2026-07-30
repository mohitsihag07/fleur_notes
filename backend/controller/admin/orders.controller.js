const db = require("../../models");
const helper = require("../../helper/helper");
const { Order, OrderItem, User, UserAddress, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      module: 'admin_orders',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getOrdersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { payment_status: { $regex: search, $options: 'i' } }
      ];
    }
    if (statusFilter && statusFilter !== 'all') query.status = statusFilter;

    const [rows, count] = await Promise.all([
      Order.find(query)
        .populate('user_id', 'id name email phone')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Order.countDocuments(query)
    ]);

    const [totalOrders, pendingCount, deliveredCount] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
    ]);

    const processingCount = await Order.countDocuments({
      status: { $in: ['confirmed', 'packed', 'shipped', 'out_for_delivery'] }
    });

    const allOrders = await Order.find({}, 'grand_total status').lean();
    const totalRevenue = allOrders.reduce((acc, o) => acc + (parseFloat(o.grand_total) || 0), 0).toFixed(2);

    await logActivity(req.user._id, 'VIEW_ORDERS', 'Fetched list of orders', req);

    const rowsWithUser = rows.map(o => ({ ...o, user: o.user_id }));

    return helper.success(res, 'Successfully fetched list of orders', {
      data: rowsWithUser,
      stats: { totalOrders, pendingCount, processingCount, deliveredCount, totalRevenue },
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    return helper.error(res, 'Server error loading orders', 500);
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'id name email phone')
      .populate('address_id')
      .lean({ virtuals: true });
    if (!order) return helper.error(res, "Order not found", 404);

    const items = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'id name slug')
      .lean({ virtuals: true });

    const result = { ...order, user: order.user_id, address: order.address_id, items };
    await logActivity(req.user._id, 'VIEW_ORDER', `Order details viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Order found", result, 200);
  } catch (error) {
    console.error("Error loading order:", error);
    return helper.error(res, "Server error loading order", 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return helper.error(res, "Order not found", 404);

    const { status, payment_status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];
    if (status && !validStatuses.includes(status)) return helper.error(res, "Invalid status value", 400);
    if (payment_status && !['pending', 'paid', 'failed', 'refunded'].includes(payment_status)) {
      return helper.error(res, "Invalid payment status value", 400);
    }

    const oldStatus = order.status;
    if (status !== undefined) {
      order.status = status;
      if (status === 'delivered') order.delivered_at = new Date();
      else if (status === 'cancelled') order.cancelled_at = new Date();
    }
    if (payment_status !== undefined) order.payment_status = payment_status;
    await order.save();

    await logActivity(req.user._id, 'UPDATE_ORDER_STATUS', `Order ID ${order._id} status updated from ${oldStatus} to ${status || oldStatus}`, req);
    return helper.success(res, "Order status updated successfully", order, 200);
  } catch (error) {
    console.error("Error updating order status:", error);
    return helper.error(res, "Server error updating order status", 500);
  }
};

module.exports = { getOrdersList, getOrder, updateOrderStatus };