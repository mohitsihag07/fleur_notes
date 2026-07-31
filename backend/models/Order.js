const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  order_number: { type: String, required: true, unique: true, maxlength: 30 },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address_id: { type: Schema.Types.ObjectId, ref: 'UserAddress', required: true },
  coupon_id: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping_charge: { type: Number, default: 0 },
  grand_total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'],
    default: 'pending',
  },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  payment_method: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'cod', 'upi', 'card', null], default: null },
  notes: { type: String, default: null },
  return_type: { type: String, enum: ['return', 'exchange', null], default: null },
  return_reason: { type: String, default: null },
  return_notes: { type: String, default: null },
  return_requested_at: { type: Date, default: null },
  cancelled_at: { type: Date, default: null },
  delivered_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.index({ order_number: 1 });
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
