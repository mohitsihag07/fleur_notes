const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentTransactionSchema = new Schema({
  payment_id: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  type: { type: String, enum: ['charge', 'refund', 'webhook'], default: 'charge' },
  request: { type: Schema.Types.Mixed, default: null },
  response: { type: Schema.Types.Mixed, default: null },
  status: { type: String, default: null },
  gateway_event_id: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

paymentTransactionSchema.index({ payment_id: 1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
module.exports = PaymentTransaction;
