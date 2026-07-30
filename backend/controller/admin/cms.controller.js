const db = require("../../models");
const helper = require("../../helper/helper");
const { Cms, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_cms', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const DEFAULT_TITLES = {
  'about-us': 'About Us',
  'terms-and-conditions': 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy'
};

const getCmsPagesList = async (req, res) => {
  try {
    const pages = await Cms.find().sort({ created_at: 1 }).lean({ virtuals: true });
    return helper.success(res, "Successfully fetched CMS pages", pages, 200);
  } catch (e) { console.error("Error fetching CMS pages:", e); return helper.error(res, "Server error loading CMS pages", 500); }
};

const getCmsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cmsPage = await Cms.findOne({ slug }).lean({ virtuals: true });
    if (!cmsPage) {
      return helper.success(res, "CMS Page placeholder", {
        slug,
        title: DEFAULT_TITLES[slug] || 'CMS Page',
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
        ],
        is_new: true
      }, 200);
    }
    return helper.success(res, "CMS Page details found", cmsPage, 200);
  } catch (e) { console.error("Error fetching CMS page:", e); return helper.error(res, "Server error fetching CMS page", 500); }
};

const updateCmsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      title,
      description,
      values_section_title,
      values_section_subtitle,
      values_section_description,
      values,
      trust_badges
    } = req.body;

    let cmsPage = await Cms.findOne({ slug });

    // Handle image uploads (via uploadFields, files are in req.files)
    let imagePath = cmsPage ? cmsPage.image : null;
    let valuesSectionImagePath = cmsPage ? cmsPage.values_section_image : null;

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imagePath = `/images/cms/${req.files['image'][0].filename}`;
      }
      if (req.files['values_section_image'] && req.files['values_section_image'][0]) {
        valuesSectionImagePath = `/images/cms/${req.files['values_section_image'][0].filename}`;
      }
    }

    // Parse JSON arrays sent as strings
    let parsedValues = cmsPage ? cmsPage.values : [];
    let parsedTrustBadges = cmsPage ? cmsPage.trust_badges : [];

    if (values !== undefined) {
      try { parsedValues = typeof values === 'string' ? JSON.parse(values) : values; }
      catch (e) { parsedValues = Array.isArray(values) ? values : []; }
    }
    if (trust_badges !== undefined) {
      try { parsedTrustBadges = typeof trust_badges === 'string' ? JSON.parse(trust_badges) : trust_badges; }
      catch (e) { parsedTrustBadges = Array.isArray(trust_badges) ? trust_badges : []; }
    }

    if (!cmsPage) {
      cmsPage = await Cms.create({
        slug,
        title: title || DEFAULT_TITLES[slug] || slug,
        description: description || '',
        image: imagePath,
        values_section_title: values_section_title || 'More Than Just Products',
        values_section_subtitle: values_section_subtitle || 'OUR VALUES',
        values_section_description: values_section_description || '',
        values_section_image: valuesSectionImagePath,
        values: parsedValues,
        trust_badges: parsedTrustBadges
      });
    } else {
      if (title !== undefined) cmsPage.title = title;
      if (description !== undefined) cmsPage.description = description;
      if (values_section_title !== undefined) cmsPage.values_section_title = values_section_title;
      if (values_section_subtitle !== undefined) cmsPage.values_section_subtitle = values_section_subtitle;
      if (values_section_description !== undefined) cmsPage.values_section_description = values_section_description;
      if (values !== undefined) cmsPage.values = parsedValues;
      if (trust_badges !== undefined) cmsPage.trust_badges = parsedTrustBadges;
      cmsPage.image = imagePath;
      cmsPage.values_section_image = valuesSectionImagePath;
      await cmsPage.save();
    }

    await logActivity(req.user._id, 'UPDATE_CMS_PAGE', `CMS page updated for slug: ${slug}`, req);
    return helper.success(res, `CMS page for "${slug}" updated successfully`, cmsPage, 200);
  } catch (e) { console.error("Error updating CMS page:", e); return helper.error(res, "Server error updating CMS page", 500); }
};

module.exports = { getCmsPagesList, getCmsBySlug, updateCmsBySlug };
