const db = require("../../models");
const helper = require("../../helper/helper");
const { Coupon, CouponUsage } = db;

const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      status: 'active',
      deleted_at: null,
      $or: [
        { expiry_date: null },
        { expiry_date: { $gte: now } }
      ]
    }).sort({ created_at: -1 }).lean();

    let userUsages = [];
    if (req.user && req.user._id) {
      userUsages = await CouponUsage.find({ user_id: req.user._id }).lean();
    }

    const formatted = coupons
      .filter(c => {
        if (c.usage_limit && c.used_count >= c.usage_limit) return false;
        if (req.user && req.user._id) {
          const userCount = userUsages.filter(u => String(u.coupon_id) === String(c._id)).length;
          const userLimit = c.per_user_limit !== undefined ? c.per_user_limit : 1;
          if (userCount >= userLimit) return false;
        }
        return true;
      })
      .map(c => ({
        id: c._id,
        code: c.code,
        type: c.type,
        value: c.value,
        discountText: c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`,
        description: c.minimum_amount > 0 
          ? `Get ${c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} off on orders above ₹${c.minimum_amount}.` 
          : `Get ${c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} off storewide.`,
        minAmount: c.minimum_amount,
        perUserLimit: c.per_user_limit || 1,
        expiryDate: c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'No Expiry'
      }));

    return helper.success(res, "Active coupons retrieved successfully", formatted);
  } catch (error) {
    console.error("Get Active Coupons Error:", error);
    return helper.error(res, "Failed to retrieve coupons", 500);
  }
};

module.exports = {
  getActiveCoupons
};
