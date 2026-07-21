const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { ContactMessage, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_contacts',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getContactsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { subject: { [Op.like]: `%${search}%` } },
                { message: { [Op.like]: `%${search}%` } }
            ];
        }

        if (statusFilter && statusFilter !== 'all') {
            whereClause.status = statusFilter;
        }

        const { count, rows } = await ContactMessage.findAndCountAll({
            where: whereClause,
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Calculate statistics
        const totalMessages = await ContactMessage.count();
        const openCount = await ContactMessage.count({ where: { status: 'open' } });
        const inProgressCount = await ContactMessage.count({ where: { status: 'in_progress' } });
        const closedCount = await ContactMessage.count({ where: { status: 'closed' } });
        
        await logActivity(req.user.id, 'VIEW_CONTACTS', `Fetched list of contact messages`, req);
        
        return helper.success(res, `Successfully fetched list of contact messages`, {
            data: rows,
            stats: {
                totalMessages,
                openCount,
                inProgressCount,
                closedCount
            },
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading contacts:`, error);
        return helper.error(res, 'Server error loading contacts', 500);
    }
};  

const getContact = async (req, res) => {
    try {
        const contact = await ContactMessage.findOne({
            where: { id: req.params.id }
        });
        if (!contact) {
            return helper.error(res, "Contact message not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_CONTACT', `Contact message details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Contact message found", contact, 200);
    } catch (error) {
        console.error("Error loading contact message:", error);
        return helper.error(res, "Server error loading contact message", 500);
    }
};  

const replyContactMessage = async (req, res) => {
    try {
        const contact = await ContactMessage.findOne({ where: { id: req.params.id } });
        if (!contact) {
            return helper.error(res, "Contact message not found", 404);
        }
        const { admin_reply, status } = req.body;
        
        if (status && !['open', 'in_progress', 'closed'].includes(status)) {
            return helper.error(res, "Invalid status. Must be open, in_progress, or closed", 400);
        }

        await contact.update({
            admin_reply: admin_reply !== undefined ? admin_reply : contact.admin_reply,
            status: status !== undefined ? status : 'closed',
            replied_at: admin_reply ? new Date() : contact.replied_at
        });

        await logActivity(req.user.id, 'REPLY_CONTACT', `Replied to contact message ID ${contact.id}`, req);
        return helper.success(res, "Replied to contact message successfully", contact, 200);
    } catch (error) {
        console.error("Error replying to contact message:", error);
        return helper.error(res, "Server error replying to contact message", 500);
    }
};

const deleteContact = async (req, res) => {
    try {
        const contact = await ContactMessage.findOne({ where: { id: req.params.id } });
        if (!contact) {
            return helper.error(res, "Contact message not found", 404);
        }
        await contact.destroy();
        await logActivity(req.user.id, 'DELETE_CONTACT', `Contact message deleted for ID ${req.params.id}`, req);
        return helper.success(res, "Contact message deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting contact message:", error);
        return helper.error(res, "Server error deleting contact message", 500);
    }
};  

module.exports = {
    getContactsList,
    getContact,
    replyContactMessage,
    deleteContact,
};
