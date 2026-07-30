const db = require("../../models");
const helper = require("../../helper/helper");
const { Faq, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({ user_id: userId, action, module: 'admin_faqs', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null });
  } catch (e) { console.error("Failed to log activity:", e); }
};

const getFAQsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const [rawRows, count] = await Promise.all([
      Faq.find(query).sort({ sort_order: 1, created_at: -1 }).skip(skip).limit(limit).lean(),
      Faq.countDocuments(query)
    ]);

    const rows = rawRows.map(item => ({
      ...item,
      id: item._id.toString()
    }));

    await logActivity(req.user._id, 'VIEW_FAQS', 'Fetched list of FAQs', req);
    return helper.success(res, 'Successfully fetched list of FAQs', {
      data: rows,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit) || 1, currentPage: page, limit }
    });
  } catch (e) {
    console.error("getFAQsList Error:", e);
    return helper.error(res, 'Server error loading FAQs', 500);
  }
};

const getFAQ = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id).lean();
    if (!faq) return helper.error(res, "FAQ not found", 404);
    faq.id = faq._id.toString();
    await logActivity(req.user._id, 'VIEW_FAQ', `FAQ viewed for ID ${req.params.id}`, req);
    return helper.success(res, "FAQ found", faq, 200);
  } catch (e) {
    console.error("getFAQ Error:", e);
    return helper.error(res, "Server error loading FAQ", 500);
  }
};

const createFAQ = async (req, res) => {
  try {
    const { question, answer, status, category, sort_order } = req.body;
    if (!question || !answer) return helper.error(res, "Question and answer are required", 400);
    if (status && !['active', 'inactive'].includes(status)) return helper.error(res, "Status must be active or inactive", 400);
    
    const faq = await Faq.create({
      question,
      answer,
      category: category || 'General',
      sort_order: parseInt(sort_order) || 0,
      status: status || 'active'
    });

    const result = faq.toObject();
    result.id = result._id.toString();
    await logActivity(req.user._id, 'ADD_FAQ', `FAQ added successfully`, req);
    return helper.success(res, "FAQ added successfully", result, 201);
  } catch (e) {
    console.error("createFAQ Error:", e);
    return helper.error(res, "Server error adding FAQ", 500);
  }
};

const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, sort_order, status } = req.body;
    const faq = await Faq.findById(req.params.id);
    if (!faq) return helper.error(res, "FAQ not found", 404);

    if (status && !['active', 'inactive'].includes(status)) {
      return helper.error(res, "Status must be active or inactive", 400);
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (sort_order !== undefined) faq.sort_order = parseInt(sort_order) || 0;
    if (status !== undefined) faq.status = status;

    await faq.save();
    await logActivity(req.user._id, 'EDIT_FAQ', `FAQ edited for ID ${faq._id}`, req);

    const result = faq.toObject();
    result.id = result._id.toString();
    return helper.success(res, "FAQ updated successfully", result, 200);
  } catch (e) {
    console.error("updateFAQ Error:", e);
    return helper.error(res, "Server error updating FAQ", 500);
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return helper.error(res, "FAQ not found", 404);
    await Faq.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_FAQ', `FAQ deleted for ID ${faq._id}`, req);
    return helper.success(res, "FAQ deleted successfully", {}, 200);
  } catch (e) {
    console.error("deleteFAQ Error:", e);
    return helper.error(res, "Server error deleting FAQ", 500);
  }
};

module.exports = { getFAQsList, getFAQ, createFAQ, updateFAQ, deleteFAQ };