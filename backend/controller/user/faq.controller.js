const db = require("../../models");
const helper = require("../../helper/helper");
const { Faq } = db;

const getPublicFAQs = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { status: 'active' };
    if (category && category !== 'All') {
      query.category = category;
    }

    const faqs = await Faq.find(query)
      .sort({ sort_order: 1, created_at: -1 })
      .lean();

    const mapped = faqs.map(f => ({
      id: f._id.toString(),
      question: f.question,
      answer: f.answer,
      category: f.category || 'General',
      sort_order: f.sort_order
    }));

    return helper.success(res, 'FAQs fetched successfully', mapped, 200);
  } catch (e) {
    console.error("getPublicFAQs Error:", e);
    return helper.error(res, 'Server error loading FAQs', 500);
  }
};

module.exports = { getPublicFAQs };
