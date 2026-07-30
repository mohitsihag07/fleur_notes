const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistItemSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

wishlistItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);
module.exports = WishlistItem;
