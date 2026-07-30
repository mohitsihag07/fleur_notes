const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

cartItemSchema.index({ cart_id: 1 });

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;
