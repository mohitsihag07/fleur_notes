const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportConversationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  user_name: { type: String, required: true, maxlength: 100 },
  user_email: { type: String, default: null },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  unread_admin: { type: Number, default: 0 },
  unread_user: { type: Number, default: 0 },
  last_message: { type: String, default: null },
  last_message_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema);
module.exports = SupportConversation;
