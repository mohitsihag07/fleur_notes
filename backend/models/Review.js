const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: null },
  images: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  admin_reply: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
