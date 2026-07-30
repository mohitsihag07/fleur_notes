const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAddressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, maxlength: 20 },
  address_line1: { type: String, required: true },
  address_line2: { type: String, default: null },
  city: { type: String, required: true, maxlength: 100 },
  state: { type: String, required: true, maxlength: 100 },
  pincode: { type: String, required: true, maxlength: 10 },
  country: { type: String, required: true, default: 'India', maxlength: 100 },
  is_default: { type: Boolean, default: false },
  label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userAddressSchema.index({ user_id: 1 });

const UserAddress = mongoose.model('UserAddress', userAddressSchema);
module.exports = UserAddress;
