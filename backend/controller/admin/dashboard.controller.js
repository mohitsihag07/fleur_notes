const db = require("../../models");
const helper = require("../../helper/helper");
const { User, Order, OrderItem, Product } = db;

const dashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const [monthlyNewUsers, totalUsers, monthlyOrders, totalOrders, totalProducts, monthlyCancelledOrders] = await Promise.all([
      User.countDocuments({ role: 'user', created_at: { $gte: startOfMonth, $lte: endOfMonth } }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ created_at: { $gte: startOfMonth, $lte: endOfMonth } }),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ status: 'cancelled', created_at: { $gte: startOfMonth, $lte: endOfMonth } }),
    ]);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [todayOrders, todayNewUsers, todayCancelledOrders] = await Promise.all([
      Order.countDocuments({ created_at: { $gte: todayStart, $lte: todayEnd } }),
      User.countDocuments({ role: 'user', created_at: { $gte: todayStart, $lte: todayEnd } }),
      Order.countDocuments({ status: 'cancelled', created_at: { $gte: todayStart, $lte: todayEnd } }),
    ]);

    const todayCancellationPercentage = todayOrders > 0
      ? Number(((todayCancelledOrders / todayOrders) * 100).toFixed(1))
      : 0;

    // Monthly revenue (non-cancelled)
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, created_at: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$grand_total' } } }
    ]);
    const monthlyRevenue = Number((revenueAgg[0]?.total || 0).toFixed(2));

    // 12-month graph
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesGraph = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentYear, i, 1, 0, 0, 0, 0);
      const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

      const activeOrders = await Order.find({
        status: { $ne: 'cancelled' },
        created_at: { $gte: monthStart, $lte: monthEnd }
      }, '_id grand_total').lean();

      const activeOrderIds = activeOrders.map(o => o._id);
      let productsSold = 0;
      let totalRevenue = 0;

      if (activeOrderIds.length > 0) {
        totalRevenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0);
        const qtyAgg = await OrderItem.aggregate([
          { $match: { order_id: { $in: activeOrderIds } } },
          { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        productsSold = qtyAgg[0]?.total || 0;
      }

      monthlySalesGraph.push({
        month: monthNames[i],
        year: currentYear,
        ordersCount: activeOrders.length,
        productsSold: Number(productsSold),
        totalSales: Number(totalRevenue.toFixed(2))
      });
    }

    return helper.success(res, "Dashboard statistics loaded successfully", {
      monthlyNewUsers, totalUsers, monthlyOrders, totalOrders, totalProducts,
      monthlyCancelledOrders, monthlySalesGraph, monthlyRevenue,
      todayOrders, todayNewUsers, todayCancelledOrders, todayCancellationPercentage
    }, 200);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return helper.error(res, "Server error loading dashboard data: " + error.message, 500);
  }
};

module.exports = { dashboard };