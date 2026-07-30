const db = require("../../models");
const helper = require("../../helper/helper");
const { Shipment, Order, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_shipments', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getShipmentsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ tracking_number: { $regex: search, $options: 'i' } }, { shipping_company: { $regex: search, $options: 'i' } }];

    const [rows, count] = await Promise.all([
      Shipment.find(query).populate({ path: 'order_id', populate: { path: 'user_id', select: 'id name email phone' } }).sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Shipment.countDocuments(query)
    ]);

    const rowsWithData = rows.map(s => ({ ...s, order: s.order_id ? { ...s.order_id, user: s.order_id.user_id } : null }));

    await logActivity(req.user._id, 'VIEW_SHIPMENTS', 'Fetched list of shipments', req);
    return helper.success(res, 'Successfully fetched list of shipments', {
      data: rowsWithData,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading shipments', 500); }
};

const getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).populate({ path: 'order_id', populate: { path: 'user_id', select: 'id name email phone' } }).lean({ virtuals: true });
    if (!shipment) return helper.error(res, "Shipment not found", 404);
    await logActivity(req.user._id, 'VIEW_SHIPMENT', `Shipment viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Shipment found", { ...shipment, order: shipment.order_id ? { ...shipment.order_id, user: shipment.order_id.user_id } : null }, 200);
  } catch (e) { return helper.error(res, "Server error loading shipment", 500); }
};

const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return helper.error(res, "Shipment not found", 404);
    const { tracking_number, shipping_company, tracking_url, expected_delivery, shipped_at, delivered_at } = req.body;
    if (tracking_number !== undefined) shipment.tracking_number = tracking_number;
    if (shipping_company !== undefined) shipment.shipping_company = shipping_company;
    if (tracking_url !== undefined) shipment.tracking_url = tracking_url;
    if (expected_delivery !== undefined) shipment.expected_delivery = expected_delivery;
    if (shipped_at !== undefined) shipment.shipped_at = shipped_at;
    if (delivered_at !== undefined) shipment.delivered_at = delivered_at;
    await shipment.save();
    await logActivity(req.user._id, 'UPDATE_SHIPMENT', `Shipment updated for ID ${shipment._id}`, req);
    return helper.success(res, "Shipment updated successfully", shipment, 200);
  } catch (e) { return helper.error(res, "Server error updating shipment", 500); }
};

module.exports = { getShipmentsList, getShipment, updateShipment };