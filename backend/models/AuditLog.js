const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true, maxlength: 150 },
  module: { type: String, default: null, maxlength: 80 },
  record_id: { type: Schema.Types.ObjectId, default: null },
  old_values: { type: Schema.Types.Mixed, default: null },
  new_values: { type: Schema.Types.Mixed, default: null },
  ip_address: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ module: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
