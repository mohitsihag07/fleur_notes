const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Order, OrderItem, Product, User, UserAddress, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
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
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                { payment_status: { [Op.like]: `%${search}%` } }
            ];
        }

        if (statusFilter && statusFilter !== 'all') {
            whereClause.status = statusFilter;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Compute statistics
        const totalOrders = await Order.count();
        const pendingCount = await Order.count({ where: { status: 'pending' } });
        const processingCount = await Order.count({ where: { status: { [Op.in]: ['confirmed', 'packed', 'shipped', 'out_for_delivery'] } } });
        const deliveredCount = await Order.count({ where: { status: 'delivered' } });
        
        // Sum total revenue from delivered orders
        const allOrders = await Order.findAll({ attributes: ['grand_total', 'status'] });
        const totalRevenue = allOrders.reduce((acc, curr) => acc + (parseFloat(curr.grand_total) || 0), 0).toFixed(2);
        
        await logActivity(req.user.id, 'VIEW_ORDERS', `Fetched list of orders`, req);
        
        return helper.success(res, `Successfully fetched list of orders`, {
            data: rows,
            stats: {
                totalOrders,
                pendingCount,
                processingCount,
                deliveredCount,
                totalRevenue
            },
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading orders:`, error);
        return helper.error(res, 'Server error loading orders', 500);
    }
};  

const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: UserAddress, as: 'address' },
                { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }] },
            ],
        });
        if (!order) {
            return helper.error(res, "Order not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_ORDER', `Order details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Order found", order, 200);
    } catch (error) {
        console.error("Error loading order:", error);
        return helper.error(res, "Server error loading order", 500);
    }
};  

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findOne({ where: { id: req.params.id } });
        if (!order) {
            return helper.error(res, "Order not found", 404);
        }
        const { status, payment_status } = req.body;
        
        if (status && !['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'].includes(status)) {
            return helper.error(res, "Invalid status value", 400);
        }
        if (payment_status && !['pending', 'paid', 'failed', 'refunded'].includes(payment_status)) {
            return helper.error(res, "Invalid payment status value", 400);
        }
        
        const oldStatus = order.status;
        const updates = {};
        if (status !== undefined) {
            updates.status = status;
            if (status === 'delivered') {
                updates.delivered_at = new Date();
            } else if (status === 'cancelled') {
                updates.cancelled_at = new Date();
            }
        }
        if (payment_status !== undefined) {
            updates.payment_status = payment_status;
        }

        await order.update(updates);
        
        await logActivity(req.user.id, 'UPDATE_ORDER_STATUS', `Order ID ${order.id} status updated from ${oldStatus} to ${status || oldStatus}`, req);
        return helper.success(res, "Order status updated successfully", order, 200);
    } catch (error) {
        console.error("Error updating order status:", error);
        return helper.error(res, "Server error updating order status", 500);
    }
};

module.exports = {
    getOrdersList,
    getOrder,
    updateOrderStatus,
};