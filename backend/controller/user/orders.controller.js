const db = require("../../models");
const helper = require("../../helper/helper");
const { Order, OrderItem, ProductImage } = db;

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).lean();

        let firstImage = null;
        if (items.length > 0) {
          const firstProductImg = await ProductImage.findOne({ product_id: items[0].product_id }).lean();
          if (firstProductImg && firstProductImg.image_url) {
            firstImage = firstProductImg.image_url;
          }
        }

        return {
          id: order.order_number || `#FLR${order._id.toString().slice(-4).toUpperCase()}`,
          rawId: order._id,
          date: new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          total: `₹${Number(order.grand_total || 0).toLocaleString('en-IN')}`,
          itemsCount: `${items.length} ${items.length === 1 ? 'item' : 'items'}`,
          status: (order.status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          statusClass: getStatusBadgeClass(order.status),
          image: firstImage || '/images/products/vase.jpg',
          items: items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.price
          }))
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
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

module.exports = {
  getUserOrders
};
