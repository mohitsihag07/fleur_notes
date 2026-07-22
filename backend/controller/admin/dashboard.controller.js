const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { User, Product, Order, OrderItem } = db;

/**
 * Admin Dashboard API Controller
 * Provides real-time metrics:
 * - monthlyNewUsers (users registered in current month)
 * - monthlyOrders (orders created in current month)
 * - totalProducts (total active catalog products)
 * - monthlyCancelledOrders (cancelled orders in current month)
 * - monthlySalesGraph (12-month trend of products sold and sales totals)
 */
const dashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate start and end dates for current month
    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // 1. Monthly New Users (role = 'user', created in current month)
    const monthlyNewUsers = await User.count({
      where: {
        role: 'user',
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // Total users for reference
    const totalUsers = await User.count({ where: { role: 'user' } });

    // 2. Monthly Orders (placed in current month)
    const monthlyOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // Total orders for reference
    const totalOrders = await Order.count();

    // 3. Total Products in Catalog
    const totalProducts = await Product.count();

    // 4. Monthly Cancelled Orders (status = 'cancelled' in current month)
    const monthlyCancelledOrders = await Order.count({
      where: {
        status: 'cancelled',
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // 4.1 Today's stats calculation
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd
        }
      }
    });

    const todayNewUsers = await User.count({
      where: {
        role: 'user',
        created_at: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd
        }
      }
    });

    const todayCancelledOrders = await Order.count({
      where: {
        status: 'cancelled',
        created_at: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd
        }
      }
    });

    const todayCancellationPercentage = todayOrders > 0
      ? Number(((todayCancelledOrders / todayOrders) * 100).toFixed(1))
      : 0;

    // 4.2 Monthly Revenue calculation (sum of non-cancelled orders in current month)
    const monthlyRevenueRes = await Order.sum('grand_total', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    }) || 0;
    const monthlyRevenue = Number(parseFloat(monthlyRevenueRes).toFixed(2));

    // 5. 12-Month Graph of Products Selling & Sales
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesGraph = [];

    // Loop through the 12 months of the current year
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentYear, i, 1, 0, 0, 0, 0);
      const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

      // Fetch non-cancelled orders for month i
      const activeOrders = await Order.findAll({
        attributes: ['id', 'grand_total'],
        where: {
          status: { [Op.ne]: 'cancelled' },
          created_at: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd
          }
        }
      });

      const activeOrderIds = activeOrders.map(order => order.id);
      let productsSold = 0;
      let totalRevenue = 0;

      if (activeOrderIds.length > 0) {
        totalRevenue = activeOrders.reduce((sum, order) => sum + parseFloat(order.grand_total || 0), 0);

        productsSold = await OrderItem.sum('quantity', {
          where: {
            order_id: { [Op.in]: activeOrderIds }
          }
        }) || 0;
      }

      monthlySalesGraph.push({
        month: monthNames[i],
        year: currentYear,
        ordersCount: activeOrders.length,
        productsSold: Number(productsSold),
        totalSales: Number(totalRevenue.toFixed(2))
      });
    }

    return helper.success(
      res,
      "Dashboard statistics loaded successfully",
      {
        monthlyNewUsers,
        totalUsers,
        monthlyOrders,
        totalOrders,
        totalProducts,
        monthlyCancelledOrders,
        monthlySalesGraph,
        monthlyRevenue,
        todayOrders,
        todayNewUsers,
        todayCancelledOrders,
        todayCancellationPercentage
      },
      200
    );
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return helper.error(res, "Server error loading dashboard data: " + error.message, 500);
  }
};

module.exports = {
  dashboard
};