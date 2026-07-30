const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  gateway: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'cod'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR', maxlength: 5 },
  transaction_id: { type: String, default: null },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paid_at: { type: Date, default: null },
  refunded_at: { type: Date, default: null },
  refund_amount: { type: Number, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

paymentSchema.index({ transaction_id: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
