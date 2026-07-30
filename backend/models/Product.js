const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, maxlength: 250 },
  sku: { type: String, required: true, unique: true, maxlength: 100 },
  short_description: { type: String, default: null },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  sale_price: { type: Number, default: null },
  weight: { type: Number, default: null },
  length: { type: Number, default: null },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  color: { type: String, default: null },
  is_featured: { type: Boolean, default: false },
  is_best_seller: { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category_id: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
