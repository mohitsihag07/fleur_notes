const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Banner, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_banners',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getBannersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } }
            ];
        }
        if (status) {
            whereClause.status = status;
        }
        
        const { count, rows } = await Banner.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [
                ['display_order', 'ASC']
            ]
        });
        
        await logActivity(req.user.id, 'VIEW_BANNERS', 'Banners list viewed', req);
        
        return helper.success(res, "Banners list fetched successfully", { 
            banners: rows, 
            meta: { 
                totalItems: count, 
                totalPages: Math.ceil(count / limit), 
                currentPage: page, 
                limit 
            } 
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return helper.error(res, "Failed to fetch banners", 500);
    }
}

const getBanner = async (req, res) => {
    try {
        const banner = await Banner.findOne({
            where: { id: req.params.id }
        });
        if (!banner) {
            return helper.error(res, "Banner not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_BANNER', `Banner details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Banner fetched successfully", banner);
    } catch (error) {
        console.error("Error fetching banner:", error);
        return helper.error(res, "Failed to fetch banner", 500);
    }
}

const addBanner = async (req, res) => {
    try {
        const { title, subtitle, image, button_text, button_link, status, display_order } = req.body;
        
        if (!image) {
            return helper.error(res, "Banner image is required", 400);
        }

        const banner = await Banner.create(req.body);
        
        await logActivity(req.user.id, 'ADD_BANNER', `Banner '${title || 'Untitled'}' added successfully`, req);
        return helper.success(res, "Banner added successfully", banner);
    } catch (error) {
        console.error("Error adding banner:", error);
        return helper.error(res, "Failed to add banner", 500);
    }
}

const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findOne({
            where: { id: req.params.id }
        });
        if (!banner) {
            return helper.error(res, "Banner not found", 404);
        }
        
        await banner.update(req.body);
        
        await logActivity(req.user.id, 'EDIT_BANNER', `Banner with ID ${req.params.id} updated successfully`, req);
        return helper.success(res, "Banner updated successfully", banner);
    } catch (error) {
        console.error("Error updating banner:", error);
        return helper.error(res, "Failed to update banner", 500);
    }
}

const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findOne({
            where: { id: req.params.id }
        });
        if (!banner) {
            return helper.error(res, "Banner not found", 404);
        }
        await banner.destroy();
        await logActivity(req.user.id, 'DELETE_BANNER', `Banner with ID ${req.params.id} deleted`, req);
        return helper.success(res, "Banner deleted successfully", banner);
    } catch (error) {
        console.error("Error deleting banner:", error);
        return helper.error(res, "Failed to delete banner", 500);
    }
}

const updateBannerStatus = async (req, res) => {
    try {
        const banner = await Banner.findOne({
            where: { id: req.params.id }
        });
        if (!banner) {
            return helper.error(res, "Banner not found", 404);
        }
        
        const oldStatus = banner.status;
        const newStatus = oldStatus === 'active' ? 'inactive' : 'active';
        
        await banner.update({
            status: newStatus
        });
        
        await logActivity(req.user.id, 'UPDATE_BANNER_STATUS', `Banner status updated from ${oldStatus} to ${newStatus} for banner ID ${banner.id}`, req);
        return helper.success(res, "Banner status updated successfully", banner);
    } catch (error) {
        console.error("Error updating banner status:", error);
        return helper.error(res, "Failed to update banner status", 500);
    }
}

const uploadBannerImage = async (req, res) => {
    try {
        if (!req.file) {
            return helper.error(res, "No image file provided", 400);
        }
        const imageUrl = `/images/banners/${req.file.filename}`;
        return helper.success(res, "Banner image uploaded successfully", { imageUrl });
    } catch (error) {
        console.error("Error uploading banner image:", error);
        return helper.error(res, "Failed to upload banner image", 500);
    }
}

module.exports = {
    getBannersList,
    getBanner,
    addBanner,
    updateBanner,
    deleteBanner,
    updateBannerStatus,
    uploadBannerImage
}


