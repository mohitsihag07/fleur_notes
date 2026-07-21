const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { User, UserProfile, UserAddress, Cart, Order, OrderItem, Review, Product, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_users',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const role = req.query.role || 'user';
    const offset = (page - 1) * limit;

    const whereClause = {
      role,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: UserProfile, as: 'profile', attributes: ['profile_picture', 'gender', 'date_of_birth'] },
        { model: UserAddress, as: 'addresses', attributes: ['address_line1', 'address_line2', 'city', 'state', 'pincode', 'country'] },
      ],
      distinct: true,
      limit,
      offset,
    });
    
    await logActivity(req.user.id, 'VIEW_USERS', `Fetched list of ${role}s`, req);
    
    return helper.success(res, `Successfully fetched list of ${role}s`, {
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error(`Error loading users:`, error);
    return helper.error(res, 'Server error loading users', 500);
  }
}; 

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            include: [
                { model: UserProfile, as: 'profile' },
                { model: UserAddress, as: 'addresses' },
            ],
        });
        if (!user) {
            return helper.error(res, "User not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_USER', `User details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "User found", user, 200);
    } catch (error) {
        return helper.error(res, "Server error loading user", 500);
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        if (!user) {
            return helper.error(res, "User not found", 404);
        }
        await user.destroy();
        await logActivity(req.user.id, 'DELETE_USER', `Deleted user with ID ${req.params.id}`, req);
        return helper.success(res, "User deleted", {}, 200);
    } catch (error) {
        return helper.error(res, "Server error deleting user", 500);
    }
}

const userStatusUpdate = async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findOne({ where: { id: req.params.id } });
        if (!user) {
            return helper.error(res, "User not found", 404);
        }
        const oldStatus = user.status;
        await user.update({ status });
        await logActivity(req.user.id, 'UPDATE_USER_STATUS', `User status updated from ${oldStatus} to ${status} for user ID ${user.id}`, req);
        return helper.success(res, "User status updated", {}, 200);
    } catch (error) {
        return helper.error(res, "Server error updating user status", 500);
    }
}

module.exports = {
    getUsersList,
    getUser,
    deleteUser,
    userStatusUpdate
}