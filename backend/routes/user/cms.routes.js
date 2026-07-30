const express = require("express");
const router = express.Router();
const { Cms } = require("../../models");
const helper = require("../../helper/helper");

const DEFAULT_ABOUT = {
  slug: 'about-us',
  title: 'About Us',
  description: '',
  image: null,
  values_section_title: 'More Than Just Products',
  values_section_subtitle: 'OUR VALUES',
  values_section_description: "We believe in the beauty of thoughtful living. That's why every product we create or curate is designed to add meaning, comfort, and elegance to your everyday moments.",
  values_section_image: null,
  values: ['Timeless designs that inspire', 'Handpicked materials, always', 'Small batch, maximum care', 'Made to be loved, made to last'],
  trust_badges: [
    { icon: 'heart', title: 'Handmade with Love', description: 'Every piece is thoughtfully handcrafted with care.' },
    { icon: 'leaf', title: 'Sustainable & Ethical', description: 'We use eco-friendly materials and responsible practices.' },
    { icon: 'shield-check', title: 'Premium Quality', description: 'Quality you can see and feel in every single detail.' },
    { icon: 'star', title: 'Loved by Customers', description: 'Thousands of happy customers trust and love our products.' }
  ]
};

// Public GET by slug — no auth required
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const cmsPage = await Cms.findOne({ slug }).lean({ virtuals: true });
    if (!cmsPage) {
      return helper.success(res, "CMS page (default)", DEFAULT_ABOUT, 200);
    }
    return helper.success(res, "CMS page found", cmsPage, 200);
  } catch (e) {
    console.error("Error fetching public CMS page:", e);
    return helper.error(res, "Server error fetching CMS page", 500);
  }
});

module.exports = router;
