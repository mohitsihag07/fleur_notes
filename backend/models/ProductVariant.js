const mongoose = require('mongoose');
const { Schema } = mongoose;

const productVariantSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_name: { type: String, required: true, maxlength: 100 },
  sku: { type: String, default: null, unique: true, sparse: true },
  price: { type: Number, required: true },
  sale_price: { type: Number, default: null },
  stock: { type: Number, default: 0 },
  image: { type: String, default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productVariantSchema.index({ product_id: 1 });
productVariantSchema.index({ sku: 1 });

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
module.exports = ProductVariant;
