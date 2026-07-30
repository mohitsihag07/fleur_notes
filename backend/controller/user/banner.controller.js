const db = require("../../models");
const helper = require("../../helper/helper");
const { Banner } = db;

const getBannersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';
    const skip = (page - 1) * limit;

    const query = { status: 'active' };
    if (type) query.type = type;

    const [rows, count] = await Promise.all([
      Banner.find(query).sort({ display_order: 1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Banner.countDocuments(query)
    ]);

    return helper.success(res, "Banners list fetched successfully", {
      banners: rows,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { console.error("Error fetching banners:", e); return helper.error(res, "Failed to fetch banners", 500); }
};

const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ _id: req.params.id, status: 'active' }).lean({ virtuals: true });
    if (!banner) return helper.error(res, "Banner not found", 404);
    return helper.success(res, "Banner fetched successfully", banner);
  } catch (e) { return helper.error(res, "Failed to fetch banner", 500); }
};

module.exports = { getBannersList, getBanner };
