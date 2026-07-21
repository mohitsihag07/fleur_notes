const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { CustomerActivity, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_customer_activity',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getCustomerActivity = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { action: { [Op.like]: `%${search}%` } },
                { ip_address: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await CustomerActivity.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        await logActivity(req.user.id, 'VIEW_CUSTOMER_ACTIVITY', `Fetched list of customer activities`, req);
        
        return helper.success(res, `Successfully fetched list of customer activities`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading customer activities:`, error);
        return helper.error(res, 'Server error loading customer activities', 500);
    }
};  

const getCustomerActivityCount = async (req, res) => {
    try {
        const count = await CustomerActivity.count();
        await logActivity(req.user.id, 'VIEW_CUSTOMER_ACTIVITY_COUNT', `Fetched count of customer activities`, req);
        return helper.success(res, "Customer activity count fetched successfully", { count }, 200);
    } catch (error) {
        console.error("Error fetching customer activity count:", error);
        return helper.error(res, "Server error fetching customer activity count", 500);
    }
};

module.exports = {
    getCustomerActivity,
    getCustomerActivityCount
};  