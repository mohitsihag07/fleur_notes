const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema({
  tagline: { type: String, default: null },
  title: { type: String, default: null },
  description: { type: String, default: null },
  primary_cta_text: { type: String, default: null },
  primary_cta_link: { type: String, default: null },
  secondary_cta_text: { type: String, default: null },
  secondary_cta_link: { type: String, default: null },
  image: { type: String, required: true },
  display_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  type: { type: String, enum: ['home', 'shop', 'categories', 'about', 'contact'], default: 'home', required: true },
  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
