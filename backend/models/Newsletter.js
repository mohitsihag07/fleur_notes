const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsletterSchema = new Schema({
  email: { type: String, required: true, unique: true, maxlength: 150 },
  name: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  subscribed_at: { type: Date, default: Date.now },
  unsubscribed_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

newsletterSchema.index({ email: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
module.exports = Newsletter;
