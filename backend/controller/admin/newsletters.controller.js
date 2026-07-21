const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Newsletter, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_newsletters',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getNewslettersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { email: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Newsletter.findAndCountAll({
            where: whereClause,
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        await logActivity(req.user.id, 'VIEW_NEWSLETTERS', `Fetched list of newsletters`, req);
        
        return helper.success(res, `Successfully fetched list of newsletters`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading newsletters:`, error);
        return helper.error(res, 'Server error loading newsletters', 500);
    }
};  

const toggleNewsletterSubscription = async (req, res) => {
    try {
        const newsletter = await Newsletter.findByPk(req.params.id);
        if (!newsletter) {
            return helper.error(res, "Newsletter subscriber not found", 404);
        }
        const newStatus = !newsletter.is_active;
        await newsletter.update({
            is_active: newStatus,
            unsubscribed_at: newStatus ? null : new Date()
        });
        await logActivity(req.user.id, 'TOGGLE_NEWSLETTER_SUBSCRIPTION', `Toggled subscription for ${newsletter.email} to ${newStatus}`, req);
        return helper.success(res, "Subscriber status toggled successfully", newsletter, 200);
    } catch (error) {
        console.error("Error toggling subscriber status:", error);
        return helper.error(res, "Server error toggling subscriber status", 500);
    }
};

const deleteNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findOne({ where: { id: req.params.id } });
        if (!newsletter) {
            return helper.error(res, "Newsletter not found", 404);
        }
        await newsletter.destroy();
        await logActivity(req.user.id, 'DELETE_NEWSLETTER', `Newsletter deleted for ID ${req.params.id}`, req);
        return helper.success(res, "Newsletter deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting newsletter subscriber:", error);
        return helper.error(res, "Server error deleting newsletter", 500);
    }
};  

module.exports = {
    getNewslettersList,
    toggleNewsletterSubscription,
    deleteNewsletter,
};