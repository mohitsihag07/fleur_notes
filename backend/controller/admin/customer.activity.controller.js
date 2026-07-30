const db = require("../../models");
const helper = require("../../helper/helper");
const { CustomerActivity, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_customer_activity', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getCustomerActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ action: { $regex: search, $options: 'i' } }, { ip_address: { $regex: search, $options: 'i' } }];

    const [rows, count] = await Promise.all([
      CustomerActivity.find(query).populate('user_id', 'id name email phone').sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      CustomerActivity.countDocuments(query)
    ]);

    const rowsWithUser = rows.map(a => ({ ...a, user: a.user_id }));
    await logActivity(req.user._id, 'VIEW_CUSTOMER_ACTIVITY', 'Fetched list of customer activities', req);
    return helper.success(res, 'Successfully fetched list of customer activities', {
      data: rowsWithUser,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading customer activities', 500); }
};

const getCustomerActivityCount = async (req, res) => {
  try {
    const count = await CustomerActivity.countDocuments();
    await logActivity(req.user._id, 'VIEW_CUSTOMER_ACTIVITY_COUNT', 'Fetched count of customer activities', req);
    return helper.success(res, "Customer activity count fetched successfully", { count }, 200);
  } catch (e) { return helper.error(res, "Server error fetching customer activity count", 500); }
};

module.exports = { getCustomerActivity, getCustomerActivityCount };