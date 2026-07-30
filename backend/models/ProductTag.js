const mongoose = require('mongoose');
const { Schema } = mongoose;

const productTagSchema = new Schema({
  name: { type: String, required: true, unique: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, maxlength: 150 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productTagSchema.index({ slug: 1 });

const ProductTag = mongoose.model('ProductTag', productTagSchema);
module.exports = ProductTag;
