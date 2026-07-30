const db = require("../../models");
const helper = require("../../helper/helper");
const { Coupon, CouponUsage, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_coupons', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getCouponsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ code: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;

    const [rows, count, totalCoupons, activeCoupons, inactiveCoupons, expiredCoupons] = await Promise.all([
      Coupon.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Coupon.countDocuments(query),
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: 'active' }),
      Coupon.countDocuments({ status: 'inactive' }),
      Coupon.countDocuments({ status: 'expired' })
    ]);

    const rowsWithId = rows.map(c => ({
      ...c,
      id: c._id
    }));

    await logActivity(req.user._id, 'VIEW_COUPONS', 'Fetched list of coupons', req);
    return helper.success(res, 'Successfully fetched list of coupons', {
      data: rowsWithId,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit, stats: { totalCoupons, activeCoupons, inactiveCoupons, expiredCoupons } }
    });
  } catch (e) { return helper.error(res, 'Server error loading coupons', 500); }
};

const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return helper.error(res, "Invalid coupon ID specified", 400);
    }

    const mongoose = require('mongoose');
    let coupon = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      coupon = await Coupon.findById(id).lean({ virtuals: true });
    }

    if (!coupon) {
      coupon = await Coupon.findOne({ code: id.toUpperCase() }).lean({ virtuals: true });
    }

    if (!coupon) return helper.error(res, "Coupon not found", 404);
    const usages = await CouponUsage.find({ coupon_id: coupon._id }).populate('user_id', 'id name email').lean({ virtuals: true });
    if (req.user) await logActivity(req.user._id, 'VIEW_COUPON', `Coupon viewed for ID ${id}`, req);
    return helper.success(res, "Coupon found", { ...coupon, id: coupon._id, usages }, 200);
  } catch (e) { return helper.error(res, "Server error loading coupon", 500); }
};

const addCoupon = async (req, res) => {
  try {
    const { code, type, discount_type, value, discount_value, minimum_amount, maximum_discount, usage_limit, per_user_limit, expiry_date, status } = req.body;
    const finalCode = code ? code.toUpperCase().trim() : '';
    const finalType = type || discount_type;
    const finalValue = value !== undefined ? value : discount_value;
    if (!finalCode || !finalType || finalValue === undefined) return helper.error(res, "Missing required fields: code, type, and value", 400);
    if (!['percentage', 'fixed'].includes(finalType)) return helper.error(res, "Invalid coupon type", 400);
    const existingCoupon = await Coupon.findOne({ code: finalCode });
    if (existingCoupon) return helper.error(res, "Coupon code already exists", 400);
    const coupon = await Coupon.create({
      code: finalCode, type: finalType, value: parseFloat(finalValue),
      minimum_amount: minimum_amount ? parseFloat(minimum_amount) : 0,
      maximum_discount: maximum_discount ? parseFloat(maximum_discount) : null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      per_user_limit: per_user_limit ? parseInt(per_user_limit) : 1,
      expiry_date: expiry_date || null, status: status || 'active'
    });
    await logActivity(req.user._id, 'ADD_COUPON', `Coupon '${finalCode}' added successfully`, req);
    return helper.success(res, "Coupon added successfully", coupon, 201);
  } catch (e) { return helper.error(res, "Server error adding coupon", 500); }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return helper.error(res, "Coupon not found", 404);
    const { code, type, discount_type, value, discount_value, minimum_amount, maximum_discount, usage_limit, per_user_limit, expiry_date, status } = req.body;
    const finalCode = code ? code.toUpperCase().trim() : coupon.code;
    const finalType = type || discount_type || coupon.type;
    const finalValue = value !== undefined ? value : (discount_value !== undefined ? discount_value : coupon.value);
    if (finalCode && finalCode !== coupon.code) {
      const existing = await Coupon.findOne({ code: finalCode });
      if (existing) return helper.error(res, "Coupon code already exists", 400);
    }
    if (finalType && !['percentage', 'fixed'].includes(finalType)) return helper.error(res, "Invalid coupon type", 400);
    coupon.code = finalCode; coupon.type = finalType; coupon.value = parseFloat(finalValue);
    if (minimum_amount !== undefined) coupon.minimum_amount = parseFloat(minimum_amount);
    if (maximum_discount !== undefined) coupon.maximum_discount = maximum_discount ? parseFloat(maximum_discount) : null;
    if (usage_limit !== undefined) coupon.usage_limit = usage_limit ? parseInt(usage_limit) : null;
    if (per_user_limit !== undefined) coupon.per_user_limit = per_user_limit ? parseInt(per_user_limit) : 1;
    if (expiry_date !== undefined) coupon.expiry_date = expiry_date || null;
    if (status) coupon.status = status;
    await coupon.save();
    await logActivity(req.user._id, 'EDIT_COUPON', `Coupon edited for ID ${coupon._id}`, req);
    return helper.success(res, "Coupon updated successfully", coupon, 200);
  } catch (e) { return helper.error(res, "Server error updating coupon", 500); }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return helper.error(res, "Coupon not found", 404);
    await Coupon.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_COUPON', `Coupon deleted for ID ${coupon._id}`, req);
    return helper.success(res, "Coupon deleted successfully", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting coupon", 500); }
};

const updateCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return helper.error(res, "Coupon not found", 404);
    const oldStatus = coupon.status;
    let newStatus;
    if (req.body.status !== undefined) {
      newStatus = req.body.status;
      if (!['active', 'inactive', 'expired'].includes(newStatus)) return helper.error(res, "Invalid status value", 400);
    } else { newStatus = oldStatus === 'active' ? 'inactive' : 'active'; }
    coupon.status = newStatus;
    await coupon.save();
    await logActivity(req.user._id, 'UPDATE_COUPON_STATUS', `Coupon status updated from ${oldStatus} to ${newStatus}`, req);
    return helper.success(res, "Coupon status updated successfully", coupon, 200);
  } catch (e) { return helper.error(res, "Server error updating coupon status", 500); }
};

module.exports = { getCouponsList, getCoupon, addCoupon, updateCoupon, deleteCoupon, updateCouponStatus };