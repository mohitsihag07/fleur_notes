const db = require("../../models");
const helper = require("../../helper/helper");
const { Notification, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_notifications', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getNotificationsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const typeFilter = req.query.type || '';
    const statusFilter = req.query.status || '';
    const targetFilter = req.query.target || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { message: { $regex: search, $options: 'i' } }];
    if (typeFilter && typeFilter !== 'all') query.type = typeFilter.toLowerCase();
    if (statusFilter === 'unread') query.is_read = false;
    else if (statusFilter === 'read') query.is_read = true;
    if (targetFilter === 'specific') query.user_id = { $ne: null };
    else if (targetFilter === 'all') query.user_id = null;

    const [rows, count, totalSent, unread, push, system] = await Promise.all([
      Notification.find(query).populate('user_id', 'id name email phone role').sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Notification.countDocuments(query),
      Notification.countDocuments(),
      Notification.countDocuments({ is_read: false }),
      Notification.countDocuments({ type: { $in: ['push', 'general'] } }),
      Notification.countDocuments({ type: 'system' })
    ]);

    const rowsWithUser = rows.map(n => ({ ...n, user: n.user_id }));
    await logActivity(req.user._id, 'VIEW_NOTIFICATIONS', 'Fetched list of notifications', req);
    return helper.success(res, 'Successfully fetched list of notifications', {
      data: rowsWithUser,
      stats: { totalSent, unread, push, system },
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading notifications', 500); }
};

const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('user_id', 'id name email phone role').lean({ virtuals: true });
    if (!notification) return helper.error(res, "Notification not found", 404);
    await logActivity(req.user._id, 'VIEW_NOTIFICATION', `Notification viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Notification found", { ...notification, user: notification.user_id }, 200);
  } catch (e) { return helper.error(res, "Server error loading notification", 500); }
};

const pushNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (!title || !message) return helper.error(res, "Title and message are required", 400);
    let targetUserId = user_id || null;
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return helper.error(res, "Target user not found", 400);
    }
    const notification = await Notification.create({ user_id: targetUserId, title, message, type: (type || 'push').toLowerCase(), is_read: false });
    await logActivity(req.user._id, 'PUSH_NOTIFICATION', `Notification pushed to ${targetUserId ? `user ${targetUserId}` : 'all users'}`, req);
    return helper.success(res, "Notification sent successfully", notification, 201);
  } catch (e) { return helper.error(res, "Server error pushing notification", 500); }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return helper.error(res, "Notification not found", 404);
    await Notification.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_NOTIFICATION', `Notification deleted for ID ${req.params.id}`, req);
    return helper.success(res, "Notification deleted successfully", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting notification", 500); }
};

module.exports = { getNotificationsList, getNotification, pushNotification, deleteNotification };
