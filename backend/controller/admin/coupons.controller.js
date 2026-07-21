const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Coupon, CouponUsage, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_coupons',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getCouponsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { code: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        const { count, rows } = await Coupon.findAndCountAll({
            where: whereClause,
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        await logActivity(req.user.id, 'VIEW_COUPONS', `Fetched list of coupons`, req);
        
        return helper.success(res, `Successfully fetched list of coupons`, {
            data: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading coupons:`, error);
        return helper.error(res, 'Server error loading coupons', 500);
    }
};

const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ 
            where: { id: req.params.id },
            include: [
                {
                    model: CouponUsage,
                    as: 'usages',
                    required: false,
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ]
        });
        if (!coupon) {
            return helper.error(res, "Coupon not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_COUPON', `Coupon details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Coupon found", coupon, 200);
    } catch (error) {
        console.error("Error loading coupon:", error);
        return helper.error(res, "Server error loading coupon", 500);
    }
};

const addCoupon = async (req, res) => {
    try {
        const { 
            code, type, discount_type, value, discount_value, 
            minimum_amount, maximum_discount, usage_limit, per_user_limit, expiry_date, status 
        } = req.body;
        
        const finalCode = code ? code.toUpperCase().trim() : '';
        const finalType = type || discount_type;
        const finalValue = value !== undefined ? value : discount_value;

        if (!finalCode || !finalType || finalValue === undefined) {
            return helper.error(res, "Missing required fields: code, type, and value are required", 400);
        }

        if (!['percentage', 'fixed'].includes(finalType)) {
            return helper.error(res, "Invalid coupon type. Must be percentage or fixed", 400);
        }

        // Check uniqueness of coupon code
        const existingCoupon = await Coupon.findOne({ where: { code: finalCode } });
        if (existingCoupon) {
            return helper.error(res, "Coupon code already exists", 400);
        }

        const coupon = await Coupon.create({
            code: finalCode,
            type: finalType,
            value: parseFloat(finalValue),
            minimum_amount: minimum_amount ? parseFloat(minimum_amount) : 0,
            maximum_discount: maximum_discount ? parseFloat(maximum_discount) : null,
            usage_limit: usage_limit ? parseInt(usage_limit) : null,
            per_user_limit: per_user_limit ? parseInt(per_user_limit) : 1,
            expiry_date: expiry_date || null,
            status: status || 'active'
        });

        await logActivity(req.user.id, 'ADD_COUPON', `Coupon '${finalCode}' added successfully with ID ${coupon.id}`, req);
        return helper.success(res, "Coupon added successfully", coupon, 201);
    } catch (error) {
        console.error("Error adding coupon:", error);
        return helper.error(res, "Server error adding coupon", 500);
    }
};

const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ where: { id: req.params.id } });
        if (!coupon) {
            return helper.error(res, "Coupon not found", 404);
        }

        const { 
            code, type, discount_type, value, discount_value,
            minimum_amount, maximum_discount, usage_limit, per_user_limit, expiry_date, status 
        } = req.body;

        const finalCode = code ? code.toUpperCase().trim() : coupon.code;
        const finalType = type || discount_type || coupon.type;
        const finalValue = value !== undefined ? value : (discount_value !== undefined ? discount_value : coupon.value);

        if (finalCode && finalCode !== coupon.code) {
            const existingCoupon = await Coupon.findOne({ where: { code: finalCode } });
            if (existingCoupon) {
                return helper.error(res, "Coupon code already exists", 400);
            }
        }

        if (finalType && !['percentage', 'fixed'].includes(finalType)) {
            return helper.error(res, "Invalid coupon type. Must be percentage or fixed", 400);
        }

        await coupon.update({
            code: finalCode,
            type: finalType,
            value: parseFloat(finalValue),
            minimum_amount: minimum_amount !== undefined ? parseFloat(minimum_amount) : coupon.minimum_amount,
            maximum_discount: maximum_discount !== undefined ? (maximum_discount ? parseFloat(maximum_discount) : null) : coupon.maximum_discount,
            usage_limit: usage_limit !== undefined ? (usage_limit ? parseInt(usage_limit) : null) : coupon.usage_limit,
            per_user_limit: per_user_limit !== undefined ? (per_user_limit ? parseInt(per_user_limit) : 1) : coupon.per_user_limit,
            expiry_date: expiry_date !== undefined ? (expiry_date || null) : coupon.expiry_date,
            status: status || coupon.status
        });

        await logActivity(req.user.id, 'EDIT_COUPON', `Coupon details edited for ID ${coupon.id}`, req);
        return helper.success(res, "Coupon updated successfully", coupon, 200);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return helper.error(res, "Server error updating coupon", 500);
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ where: { id: req.params.id } });
        if (!coupon) {
            return helper.error(res, "Coupon not found", 404);
        }
        await coupon.destroy();
        await logActivity(req.user.id, 'DELETE_COUPON', `Coupon details deleted for ID ${coupon.id}`, req);
        return helper.success(res, "Coupon deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return helper.error(res, "Server error deleting coupon", 500);
    }
};

const updateCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ where: { id: req.params.id } });
    if (!coupon) {
      return helper.error(res, "Coupon not found", 404);
    }

    const oldStatus = coupon.status;
    let newStatus;
    if (req.body.status !== undefined) {
      newStatus = req.body.status;
      if (!['active', 'inactive', 'expired'].includes(newStatus)) {
        return helper.error(res, "Invalid status value", 400);
      }
    } else {
      newStatus = oldStatus === 'active' ? 'inactive' : 'active';
    }

    await coupon.update({ status: newStatus });
    await logActivity(req.user.id, 'UPDATE_COUPON_STATUS', `Coupon status updated from ${oldStatus} to ${newStatus} for coupon ID ${coupon.id}`, req);
    return helper.success(res, "Coupon status updated successfully", coupon, 200);
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return helper.error(res, "Server error updating coupon status", 500);
  }
};

module.exports = {
    getCouponsList,
    getCoupon,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    updateCouponStatus
};  