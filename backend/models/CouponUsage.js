const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponUsageSchema = new Schema({
  coupon_id: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  discount_amount: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);
module.exports = CouponUsage;
