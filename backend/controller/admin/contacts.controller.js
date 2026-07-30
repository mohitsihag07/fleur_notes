const db = require("../../models");
const helper = require("../../helper/helper");
const { ContactMessage, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({ user_id: userId, action, module: 'admin_contacts', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null });
  } catch (e) { console.error("Failed to log activity:", e); }
};

const getContactsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }, { message: { $regex: search, $options: 'i' } }];
    if (statusFilter && statusFilter !== 'all') query.status = statusFilter;

    const [rows, count, totalMessages, openCount, inProgressCount, closedCount] = await Promise.all([
      ContactMessage.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      ContactMessage.countDocuments(query),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'open' }),
      ContactMessage.countDocuments({ status: 'in_progress' }),
      ContactMessage.countDocuments({ status: 'closed' })
    ]);

    await logActivity(req.user._id, 'VIEW_CONTACTS', 'Fetched list of contact messages', req);
    return helper.success(res, 'Successfully fetched list of contact messages', {
      data: rows,
      stats: { totalMessages, openCount, inProgressCount, closedCount },
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading contacts', 500); }
};

const getContact = async (req, res) => {
  try {
    const contact = await ContactMessage.findById(req.params.id).lean({ virtuals: true });
    if (!contact) return helper.error(res, "Contact message not found", 404);
    await logActivity(req.user._id, 'VIEW_CONTACT', `Contact message viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Contact message found", contact, 200);
  } catch (e) { return helper.error(res, "Server error loading contact message", 500); }
};

const replyContactMessage = async (req, res) => {
  try {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) return helper.error(res, "Contact message not found", 404);
    const { admin_reply, status } = req.body;
    if (status && !['open', 'in_progress', 'closed'].includes(status)) return helper.error(res, "Invalid status", 400);
    if (admin_reply !== undefined) contact.admin_reply = admin_reply;
    contact.status = status !== undefined ? status : 'closed';
    if (admin_reply) contact.replied_at = new Date();
    await contact.save();
    await logActivity(req.user._id, 'REPLY_CONTACT', `Replied to contact message ID ${contact._id}`, req);
    return helper.success(res, "Replied to contact message successfully", contact, 200);
  } catch (e) { return helper.error(res, "Server error replying to contact message", 500); }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) return helper.error(res, "Contact message not found", 404);
    await ContactMessage.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_CONTACT', `Contact message deleted for ID ${req.params.id}`, req);
    return helper.success(res, "Contact message deleted successfully", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting contact message", 500); }
};

module.exports = { getContactsList, getContact, replyContactMessage, deleteContact };
