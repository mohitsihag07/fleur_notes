const db = require("../../models");
const helper = require("../../helper/helper");
const { Banner, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({ user_id: userId, action, module: 'admin_banners', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null });
  } catch (e) { console.error("Failed to log activity:", e); }
};

const getBannersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type = req.query.type || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    if (type) query.type = type;

    const [rawRows, count, totalBanners, activeBanners, homeBanners] = await Promise.all([
      Banner.find(query).sort({ display_order: 1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Banner.countDocuments(query),
      Banner.countDocuments(),
      Banner.countDocuments({ status: 'active' }),
      Banner.countDocuments({ type: 'home' })
    ]);
    const rows = rawRows.map(b => ({ ...b, id: b.id || b._id.toString() }));
    const otherBanners = totalBanners - homeBanners;

    await logActivity(req.user._id, 'VIEW_BANNERS', 'Banners list viewed', req);
    return helper.success(res, "Banners list fetched successfully", {
      banners: rows,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit, stats: { totalBanners, activeBanners, homeBanners, otherBanners } }
    });
  } catch (e) { console.error("Error fetching banners:", e); return helper.error(res, "Failed to fetch banners", 500); }
};

const getBanner = async (req, res) => {
  try {
    const rawBanner = await Banner.findById(req.params.id).lean({ virtuals: true });
    if (!rawBanner) return helper.error(res, "Banner not found", 404);
    const banner = { ...rawBanner, id: rawBanner.id || rawBanner._id.toString() };
    await logActivity(req.user._id, 'VIEW_BANNER', `Banner viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Banner fetched successfully", banner);
  } catch (e) { return helper.error(res, "Failed to fetch banner", 500); }
};

const addBanner = async (req, res) => {
  try {
    const { tagline, title, description, primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link, image, status, display_order, type } = req.body;
    if (!image) return helper.error(res, "Banner image is required", 400);
    const banner = await Banner.create({ tagline, title, description, primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link, image, status, display_order, type: type || 'home' });
    await logActivity(req.user._id, 'ADD_BANNER', `Banner '${title || 'Untitled'}' added`, req);
    return helper.success(res, "Banner added successfully", banner);
  } catch (e) { console.error("Error adding banner:", e); return helper.error(res, "Failed to add banner", 500); }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return helper.error(res, "Banner not found", 404);
    const { tagline, title, description, primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link, image, status, display_order, type } = req.body;
    Object.assign(banner, { tagline, title, description, primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link, image, status, display_order, type });
    await banner.save();
    await logActivity(req.user._id, 'EDIT_BANNER', `Banner with ID ${req.params.id} updated`, req);
    return helper.success(res, "Banner updated successfully", banner);
  } catch (e) { console.error("Error updating banner:", e); return helper.error(res, "Failed to update banner", 500); }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return helper.error(res, "Banner not found", 404);
    await Banner.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_BANNER', `Banner with ID ${req.params.id} deleted`, req);
    return helper.success(res, "Banner deleted successfully", banner);
  } catch (e) { return helper.error(res, "Failed to delete banner", 500); }
};

const updateBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return helper.error(res, "Banner not found", 404);
    const oldStatus = banner.status;
    banner.status = oldStatus === 'active' ? 'inactive' : 'active';
    await banner.save();
    await logActivity(req.user._id, 'UPDATE_BANNER_STATUS', `Banner status updated from ${oldStatus} to ${banner.status}`, req);
    return helper.success(res, "Banner status updated successfully", banner);
  } catch (e) { return helper.error(res, "Failed to update banner status", 500); }
};

const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return helper.error(res, "No image file provided", 400);
    return helper.success(res, "Banner image uploaded successfully", { imageUrl: `/images/banners/${req.file.filename}` });
  } catch (e) { return helper.error(res, "Failed to upload banner image", 500); }
};

module.exports = { getBannersList, getBanner, addBanner, updateBanner, deleteBanner, updateBannerStatus, uploadBannerImage };
