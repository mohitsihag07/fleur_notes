const mongoose = require('mongoose');
const { Schema } = mongoose;

const productImageSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  image: { type: String, required: true },
  alt_text: { type: String, default: null },
  is_thumbnail: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productImageSchema.index({ product_id: 1 });

const ProductImage = mongoose.model('ProductImage', productImageSchema);
module.exports = ProductImage;
