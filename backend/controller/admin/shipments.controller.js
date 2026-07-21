const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Shipment, Order, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_shipments',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getShipmentsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { tracking_number: { [Op.like]: `%${search}%` } },
                { shipping_company: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Shipment.findAndCountAll({
            where: whereClause,
            include: [
                { model: Order, as: 'order', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }] },
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        await logActivity(req.user.id, 'VIEW_SHIPMENTS', `Fetched list of shipments`, req);

        return helper.success(res, `Successfully fetched list of shipments`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading shipments:`, error);
        return helper.error(res, 'Server error loading shipments', 500);
    }
};

const getShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            where: { id: req.params.id },
            include: [
                { model: Order, as: 'order', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }] },
            ],
        });
        if (!shipment) {
            return helper.error(res, "Shipment not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_SHIPMENT', `Shipment details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Shipment found", shipment, 200);
    } catch (error) {
        console.error("Error loading shipment:", error);
        return helper.error(res, "Server error loading shipment", 500);
    }
};

const updateShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ where: { id: req.params.id } });
        if (!shipment) {
            return helper.error(res, "Shipment not found", 404);
        }
        const { tracking_number, shipping_company, tracking_url, expected_delivery, shipped_at, delivered_at } = req.body;

        await shipment.update({
            tracking_number: tracking_number !== undefined ? tracking_number : shipment.tracking_number,
            shipping_company: shipping_company !== undefined ? shipping_company : shipment.shipping_company,
            tracking_url: tracking_url !== undefined ? tracking_url : shipment.tracking_url,
            expected_delivery: expected_delivery !== undefined ? expected_delivery : shipment.expected_delivery,
            shipped_at: shipped_at !== undefined ? shipped_at : shipment.shipped_at,
            delivered_at: delivered_at !== undefined ? delivered_at : shipment.delivered_at
        });

        await logActivity(req.user.id, 'UPDATE_SHIPMENT', `Shipment details updated for ID ${shipment.id}`, req);
        return helper.success(res, "Shipment updated successfully", shipment, 200);
    } catch (error) {
        console.error("Error updating shipment:", error);
        return helper.error(res, "Server error updating shipment", 500);
    }
};

module.exports = {
    getShipmentsList,
    getShipment,
    updateShipment
};