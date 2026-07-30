const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingSchema = new Schema({
  key: { type: String, required: true, unique: true, maxlength: 100 },
  value: { type: String, default: null },
  type: { type: String, enum: ['string', 'number', 'boolean', 'json', 'image'], default: 'string' },
  group: { type: String, default: null, maxlength: 80 },
  description: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
