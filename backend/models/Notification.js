const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true },
  type: { type: String, default: 'push', maxlength: 50 },
  reference_id: { type: Schema.Types.ObjectId, default: null },
  is_read: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

notificationSchema.index({ user_id: 1, is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
