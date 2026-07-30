const mongoose = require('mongoose');
const { Schema } = mongoose;

// In MongoDB, we store tags directly as an array of ObjectIds on the Product.
// This join table model is kept for compatibility but is largely unused.
const productTagMapSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  tag_id: { type: Schema.Types.ObjectId, ref: 'ProductTag', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productTagMapSchema.index({ product_id: 1 });
productTagMapSchema.index({ tag_id: 1 });
productTagMapSchema.index({ product_id: 1, tag_id: 1 }, { unique: true });

const ProductTagMap = mongoose.model('ProductTagMap', productTagMapSchema);
module.exports = ProductTagMap;
