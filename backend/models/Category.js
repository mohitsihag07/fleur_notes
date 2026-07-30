const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, maxlength: 150 },
  image: { type: String, default: null },
  description: { type: String, default: null },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

categorySchema.index({ slug: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
