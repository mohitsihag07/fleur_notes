const mongoose = require('mongoose');
const { Schema } = mongoose;

const trustBadgeSchema = new Schema({
  icon: { type: String, default: 'heart' },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const cmsSchema = new Schema({
  slug: { type: String, required: true, unique: true, maxlength: 255 },
  image: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, default: null },

  // About Us — Values Section
  values_section_title: { type: String, default: 'More Than Just Products' },
  values_section_subtitle: { type: String, default: 'OUR VALUES' },
  values_section_description: { type: String, default: "We believe in the beauty of thoughtful living. That's why every product we create or curate is designed to add meaning, comfort, and elegance to your everyday moments." },
  values_section_image: { type: String, default: null },
  values: { type: [String], default: ['Timeless designs that inspire', 'Handpicked materials, always', 'Small batch, maximum care', 'Made to be loved, made to last'] },

  // About Us — Trust Badges
  trust_badges: {
    type: [trustBadgeSchema],
    default: [
      { icon: 'heart', title: 'Handmade with Love', description: 'Every piece is thoughtfully handcrafted with care.' },
      { icon: 'leaf', title: 'Sustainable & Ethical', description: 'We use eco-friendly materials and responsible practices.' },
      { icon: 'shield-check', title: 'Premium Quality', description: 'Quality you can see and feel in every single detail.' },
      { icon: 'star', title: 'Loved by Customers', description: 'Thousands of happy customers trust and love our products.' }
    ]
  },

  deleted_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const Cms = mongoose.model('Cms', cmsSchema);
module.exports = Cms;
