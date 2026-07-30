const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  name: { type: String, default: 'Customer', maxlength: 100 },
  email: { type: String, sparse: true, maxlength: 150 },
  password: { type: String, default: null },
  country_code: { type: String, maxlength: 10, default: '+91' },
  phone: { type: String, maxlength: 20, default: null },
  status: { type: String, enum: ['active', 'inactive', 'blocked', 'suspended'], default: 'active' },
  otp: { type: String, default: null },
  otp_expires_at: { type: Date, default: null },
  is_email_verified: { type: Boolean, default: false },
  is_phone_verified: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
