const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Faq, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_faqs',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getFAQsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { question: { [Op.like]: `%${search}%` } },
                { answer: { [Op.like]: `%${search}%` } },
                { category: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Faq.findAndCountAll({
            where: whereClause,
            distinct: true,
            limit,
            offset,
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });
        
        await logActivity(req.user.id, 'VIEW_FAQS', `Fetched list of FAQs`, req);
        
        return helper.success(res, `Successfully fetched list of FAQs`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading FAQs:`, error);
        return helper.error(res, 'Server error loading FAQs', 500);
    }
};

const getFAQ = async (req, res) => {
    try {
        const faq = await Faq.findOne({ where: { id: req.params.id } });
        if (!faq) {
            return helper.error(res, "FAQ not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_FAQ', `FAQ details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "FAQ found", faq, 200);
    } catch (error) {
        console.error("Error loading FAQ:", error);
        return helper.error(res, "Server error loading FAQ", 500);
    }
};

const createFAQ = async (req, res) => {
    try {
        const { question, answer, status } = req.body;
        if (!question || !answer) {
            return helper.error(res, "Question and answer are required", 400);
        }
        
        if (status && !['active', 'inactive'].includes(status)) {
            return helper.error(res, "Status must be active or inactive", 400);
        }

        const faq = await Faq.create(req.body);

        await logActivity(req.user.id, 'ADD_FAQ', `FAQ added successfully with ID ${faq.id}`, req);
        return helper.success(res, "FAQ added successfully", faq, 201);
    } catch (error) {
        console.error("Error adding FAQ:", error);
        return helper.error(res, "Server error adding FAQ", 500);
    }
};

const updateFAQ = async (req, res) => {
    try {
        const { status } = req.body;
        const faq = await Faq.findOne({ where: { id: req.params.id } });
        if (!faq) {
            return helper.error(res, "FAQ not found", 404);
        }

        if (status && !['active', 'inactive'].includes(status)) {
            return helper.error(res, "Status must be active or inactive", 400);
        }

        await faq.update(req.body);

        await logActivity(req.user.id, 'EDIT_FAQ', `FAQ details edited for ID ${faq.id}`, req);
        return helper.success(res, "FAQ updated successfully", faq, 200);
    } catch (error) {
        console.error("Error updating FAQ:", error);
        return helper.error(res, "Server error updating FAQ", 500);
    }
};

const deleteFAQ = async (req, res) => {
    try {
        const faq = await Faq.findOne({ where: { id: req.params.id } });
        if (!faq) {
            return helper.error(res, "FAQ not found", 404);
        }
        await faq.destroy();
        await logActivity(req.user.id, 'DELETE_FAQ', `FAQ details deleted for ID ${faq.id}`, req);
        return helper.success(res, "FAQ deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return helper.error(res, "Server error deleting FAQ", 500);
    }
};

module.exports = {
    getFAQsList,
    getFAQ,
    createFAQ,
    updateFAQ,
    deleteFAQ
};