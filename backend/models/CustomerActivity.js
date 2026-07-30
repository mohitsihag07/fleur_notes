const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerActivitySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, maxlength: 100 },
  ip_address: { type: String, default: null },
  user_agent: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

customerActivitySchema.index({ user_id: 1 });

const CustomerActivity = mongoose.model('CustomerActivity', customerActivitySchema);
module.exports = CustomerActivity;
