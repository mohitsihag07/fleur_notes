const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { WishlistItem, Product, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_wishlist',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getWishlistsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { id: { [Op.like]: `%${search}%` } },
                { user_id: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await WishlistItem.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] },
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        await logActivity(req.user.id, 'VIEW_WISHLISTS', `Fetched list of wishlist items`, req);
        
        return helper.success(res, `Successfully fetched list of wishlist items`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading wishlists:`, error);
        return helper.error(res, 'Server error loading wishlists', 500);
    }
};  

const getWishlist = async (req, res) => {
    try {
        const wishlist = await WishlistItem.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] },
            ],
        });
        if (!wishlist) {
            return helper.error(res, "Wishlist item not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_WISHLIST', `Wishlist item details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Wishlist item found", wishlist, 200);
    } catch (error) {
        console.error("Error loading wishlist item:", error);
        return helper.error(res, "Server error loading wishlist item", 500);
    }
};  



module.exports = {
    getWishlistsList,
    getWishlist,
};