const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Cart, CartItem, Product, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_carts',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getCartsList = async (req, res) => {
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

        const { count, rows } = await Cart.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            ],
            distinct: true,
            limit,
            offset,
        });
        
        await logActivity(req.user.id, 'VIEW_CARTS', `Fetched list of carts`, req);
        
        return helper.success(res, `Successfully fetched list of carts`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading carts:`, error);
        return helper.error(res, 'Server error loading carts', 500);
    }
}; 

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: CartItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }] },
            ],
        });
        if (!cart) {
            return helper.error(res, "Cart not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_CART', `Cart details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Cart found", cart, 200);
    } catch (error) {
        return helper.error(res, "Server error loading cart", 500);
    }
};

module.exports = {
    getCartsList,
    getCart,
};
