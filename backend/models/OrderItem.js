const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  product_name: { type: String, required: true },
  product_sku: { type: String, default: null },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderItemSchema.index({ order_id: 1 });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
