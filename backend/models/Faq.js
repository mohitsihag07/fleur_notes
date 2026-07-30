const mongoose = require('mongoose');
const { Schema } = mongoose;

const faqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Shipping', 'Returns', 'Orders', 'Payment', 'Account'],
    default: 'General'
  },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Faq = mongoose.model('Faq', faqSchema);
module.exports = Faq;
