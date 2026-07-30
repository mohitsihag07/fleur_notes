const db = require("../../models");
const helper = require("../../helper/helper");
const { Cart, CartItem, Product, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_carts', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getCartsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [rows, count] = await Promise.all([
      Cart.find().populate('user_id', 'id name email phone').sort({ _id: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Cart.countDocuments()
    ]);
    const rowsWithUser = rows.map(c => ({ ...c, user: c.user_id }));

    await logActivity(req.user._id, 'VIEW_CARTS', 'Fetched list of carts', req);
    return helper.success(res, 'Successfully fetched list of carts', {
      data: rowsWithUser,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading carts', 500); }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('user_id', 'id name email phone').lean({ virtuals: true });
    if (!cart) return helper.error(res, "Cart not found", 404);
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id', 'id name slug').lean({ virtuals: true });
    await logActivity(req.user._id, 'VIEW_CART', `Cart viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Cart found", { ...cart, user: cart.user_id, items: items.map(i => ({ ...i, product: i.product_id })) }, 200);
  } catch (e) { return helper.error(res, "Server error loading cart", 500); }
};

module.exports = { getCartsList, getCart };
