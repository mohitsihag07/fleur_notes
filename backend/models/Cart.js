const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
