const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Banner } = db;

const getBannersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type || '';
        const offset = (page - 1) * limit;
        
        // Show only active banners for users
        const whereClause = { status: 'active' };
        if (type) {
            whereClause.type = type;
        }
        
        const { count, rows } = await Banner.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [
                ['display_order', 'ASC']
            ]
        });
        
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
            where: { id: req.params.id, status: 'active' }
        });
        if (!banner) {
            return helper.error(res, "Banner not found", 404);
        }
        return helper.success(res, "Banner fetched successfully", banner);
    } catch (error) {
        console.error("Error fetching banner:", error);
        return helper.error(res, "Failed to fetch banner", 500);
    }
}

module.exports = {
    getBannersList,
    getBanner
}

