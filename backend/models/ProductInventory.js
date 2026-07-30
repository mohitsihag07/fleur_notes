const mongoose = require('mongoose');
const { Schema } = mongoose;

const productInventorySchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved_quantity: { type: Number, default: 0 },
  low_stock_limit: { type: Number, default: 5 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const ProductInventory = mongoose.model('ProductInventory', productInventorySchema);
module.exports = ProductInventory;
