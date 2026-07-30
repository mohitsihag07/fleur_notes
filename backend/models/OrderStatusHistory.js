const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderStatusHistorySchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true, maxlength: 50 },
  remarks: { type: String, default: null },
  changed_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderStatusHistorySchema.index({ order_id: 1 });

const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
module.exports = OrderStatusHistory;
