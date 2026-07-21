const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Notification, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_notifications',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getNotificationsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const typeFilter = req.query.type || '';
        const statusFilter = req.query.status || '';
        const targetFilter = req.query.target || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { message: { [Op.like]: `%${search}%` } }
            ];
        }

        if (typeFilter && typeFilter !== 'all') {
            whereClause.type = typeFilter.toLowerCase();
        }

        if (statusFilter === 'unread') {
            whereClause.is_read = false;
        } else if (statusFilter === 'read') {
            whereClause.is_read = true;
        }

        if (targetFilter === 'specific') {
            whereClause.user_id = { [Op.ne]: null };
        } else if (targetFilter === 'all') {
            whereClause.user_id = null;
        }

        const { count, rows } = await Notification.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role'] },
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        // Aggregate statistics
        const totalSent = await Notification.count();
        const unread = await Notification.count({ where: { is_read: false } });
        const push = await Notification.count({ 
            where: { 
                type: { [Op.in]: ['push', 'general'] } 
            } 
        });
        const system = await Notification.count({ 
            where: { 
                type: 'system' 
            } 
        });

        await logActivity(req.user.id, 'VIEW_NOTIFICATIONS', `Fetched list of notifications`, req);
        
        return helper.success(res, `Successfully fetched list of notifications`, {
            data: rows,
            stats: {
                totalSent,
                unread,
                push,
                system
            },
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading notifications:`, error);
        return helper.error(res, 'Server error loading notifications', 500);
    }
};  

const getNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role'] },
            ],
        });
        if (!notification) {
            return helper.error(res, "Notification not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_NOTIFICATION', `Notification details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Notification found", notification, 200);
    } catch (error) {
        console.error("Error loading notification:", error);
        return helper.error(res, "Server error loading notification", 500);
    }
};  

const pushNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        if (!title || !message) {
            return helper.error(res, "Title and message are required", 400);
        }

        let targetUserId = user_id || null;
        if (targetUserId) {
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser) {
                return helper.error(res, "Target user not found", 400);
            }
        }

        const notification = await Notification.create({
            user_id: targetUserId,
            title,
            message,
            type: (type || 'push').toLowerCase(),
            is_read: false
        });

        await logActivity(req.user.id, 'PUSH_NOTIFICATION', `Notification pushed to ${targetUserId ? `user ${targetUserId}` : 'all users'} successfully with ID ${notification.id}`, req);
        return helper.success(res, "Notification sent successfully", notification, 201);
    } catch (error) {
        console.error("Error pushing notification:", error);
        return helper.error(res, "Server error pushing notification", 500);
    }
};  

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({ where: { id: req.params.id } });
        if (!notification) {
            return helper.error(res, "Notification not found", 404);
        }
        await notification.destroy();
        await logActivity(req.user.id, 'DELETE_NOTIFICATION', `Notification deleted for ID ${req.params.id}`, req);
        return helper.success(res, "Notification deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting notification:", error);
        return helper.error(res, "Server error deleting notification", 500);
    }
};  

module.exports = {
    getNotificationsList,
    getNotification,
    pushNotification,
    deleteNotification,
};
