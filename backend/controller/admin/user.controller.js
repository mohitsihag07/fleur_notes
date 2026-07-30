const db = require("../../models");
const helper = require("../../helper/helper");
const { User, UserProfile, UserAddress, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_users', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const role = req.query.role || 'user';
    const skip = (page - 1) * limit;

    const query = { role };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;

    const [rows, count, totalUsers, activeUsers, verifiedUsers, blockedUsers] = await Promise.all([
      User.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      User.countDocuments(query),
      User.countDocuments({ role }),
      User.countDocuments({ role, status: 'active' }),
      User.countDocuments({ role, is_email_verified: true }),
      User.countDocuments({ role, status: { $in: ['blocked', 'inactive', 'suspended'] } })
    ]);

    const userIds = rows.map(u => u._id);
    const [profiles, addresses] = await Promise.all([
      UserProfile.find({ user_id: { $in: userIds } }).lean({ virtuals: true }),
      UserAddress.find({ user_id: { $in: userIds } }).lean({ virtuals: true })
    ]);

    const rowsWithData = rows.map(u => ({
      ...u,
      profile: profiles.find(p => String(p.user_id) === String(u._id)) || null,
      addresses: addresses.filter(a => String(a.user_id) === String(u._id))
    }));

    await logActivity(req.user._id, 'VIEW_USERS', `Fetched list of ${role}s`, req);
    return helper.success(res, `Successfully fetched list of ${role}s`, {
      data: rowsWithData,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit, stats: { totalUsers, activeUsers, verifiedUsers, blockedUsers } }
    });
  } catch (e) { return helper.error(res, 'Server error loading users', 500); }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean({ virtuals: true });
    if (!user) return helper.error(res, "User not found", 404);
    const [profile, addresses] = await Promise.all([
      UserProfile.findOne({ user_id: user._id }).lean({ virtuals: true }),
      UserAddress.find({ user_id: user._id }).lean({ virtuals: true })
    ]);
    await logActivity(req.user._id, 'VIEW_USER', `User viewed for ID ${req.params.id}`, req);
    return helper.success(res, "User found", { ...user, profile, addresses }, 200);
  } catch (e) { return helper.error(res, "Server error loading user", 500); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return helper.error(res, "User not found", 404);
    await User.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_USER', `Deleted user with ID ${req.params.id}`, req);
    return helper.success(res, "User deleted", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting user", 500); }
};

const userStatusUpdate = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return helper.error(res, "User not found", 404);
    const oldStatus = user.status;
    user.status = status;
    await user.save();
    await logActivity(req.user._id, 'UPDATE_USER_STATUS', `User status updated from ${oldStatus} to ${status}`, req);
    return helper.success(res, "User status updated", {}, 200);
  } catch (e) { return helper.error(res, "Server error updating user status", 500); }
};

module.exports = { getUsersList, getUser, deleteUser, userStatusUpdate };