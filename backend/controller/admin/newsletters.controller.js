const db = require("../../models");
const helper = require("../../helper/helper");
const { Newsletter, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_newsletters', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getNewslettersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ email: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }];

    const [rows, count] = await Promise.all([
      Newsletter.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Newsletter.countDocuments(query)
    ]);

    await logActivity(req.user._id, 'VIEW_NEWSLETTERS', 'Fetched list of newsletters', req);
    return helper.success(res, 'Successfully fetched list of newsletters', {
      data: rows,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading newsletters', 500); }
};

const toggleNewsletterSubscription = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return helper.error(res, "Newsletter subscriber not found", 404);
    const newStatus = !newsletter.is_active;
    newsletter.is_active = newStatus;
    newsletter.unsubscribed_at = newStatus ? null : new Date();
    await newsletter.save();
    await logActivity(req.user._id, 'TOGGLE_NEWSLETTER_SUBSCRIPTION', `Toggled subscription for ${newsletter.email} to ${newStatus}`, req);
    return helper.success(res, "Subscriber status toggled successfully", newsletter, 200);
  } catch (e) { return helper.error(res, "Server error toggling subscriber status", 500); }
};

const deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return helper.error(res, "Newsletter not found", 404);
    await Newsletter.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_NEWSLETTER', `Newsletter deleted for ID ${req.params.id}`, req);
    return helper.success(res, "Newsletter deleted successfully", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting newsletter", 500); }
};

module.exports = { getNewslettersList, toggleNewsletterSubscription, deleteNewsletter };