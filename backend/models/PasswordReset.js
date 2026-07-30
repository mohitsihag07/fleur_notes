const mongoose = require('mongoose');
const { Schema } = mongoose;

const passwordResetSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  otp: { type: String, default: null },
  expires_at: { type: Date, required: true },
  is_used: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
module.exports = PasswordReset;
