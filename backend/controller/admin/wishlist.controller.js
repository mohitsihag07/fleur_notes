const db = require("../../models");
const helper = require("../../helper/helper");
const { WishlistItem, Product, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_wishlist', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getWishlistsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [rows, count] = await Promise.all([
      WishlistItem.find().populate('user_id', 'id name email phone').populate('product_id', 'id name slug').sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      WishlistItem.countDocuments()
    ]);

    const rowsWithData = rows.map(w => ({ ...w, user: w.user_id, product: w.product_id }));
    await logActivity(req.user._id, 'VIEW_WISHLISTS', 'Fetched list of wishlist items', req);
    return helper.success(res, 'Successfully fetched list of wishlist items', {
      data: rowsWithData,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading wishlists', 500); }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await WishlistItem.findById(req.params.id).populate('user_id', 'id name email phone').populate('product_id', 'id name slug').lean({ virtuals: true });
    if (!wishlist) return helper.error(res, "Wishlist item not found", 404);
    await logActivity(req.user._id, 'VIEW_WISHLIST', `Wishlist item viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Wishlist item found", { ...wishlist, user: wishlist.user_id, product: wishlist.product_id }, 200);
  } catch (e) { return helper.error(res, "Server error loading wishlist item", 500); }
};

module.exports = { getWishlistsList, getWishlist };