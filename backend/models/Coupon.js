const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, maxlength: 50 },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minimum_amount: { type: Number, default: 0 },
  maximum_discount: { type: Number, default: null },
  usage_limit: { type: Number, default: null },
  usage_count: { type: Number, default: 0 },
  per_user_limit: { type: Number, default: 1 },
  expiry_date: { type: Date, default: null },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

couponSchema.index({ code: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
