const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportMessageSchema = new Schema({
  conversation_id: { type: Schema.Types.ObjectId, ref: 'SupportConversation', required: true },
  sender_type: { type: String, enum: ['user', 'admin', 'system'], default: 'user' },
  sender_id: { type: Schema.Types.ObjectId, default: null },
  sender_name: { type: String, default: null },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
module.exports = SupportMessage;
