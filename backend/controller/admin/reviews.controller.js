const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Review, User, Product, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_reviews',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getReviewsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const ratingFilter = req.query.rating || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { review: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } }
            ];
        }

        if (statusFilter && statusFilter !== 'all') {
            whereClause.status = statusFilter;
        }

        if (ratingFilter && ratingFilter !== 'all') {
            whereClause.rating = parseInt(ratingFilter);
        }

        const { count, rows } = await Review.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Compute overall statistics
        const totalReviews = await Review.count();
        const pendingCount = await Review.count({ where: { status: 'pending' } });
        const approvedCount = await Review.count({ where: { status: 'approved' } });
        
        // Calculate average rating
        const allRatings = await Review.findAll({ attributes: ['rating'] });
        const avgRating = allRatings.length > 0
            ? (allRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / allRatings.length).toFixed(1)
            : '0.0';
        
        await logActivity(req.user.id, 'VIEW_REVIEWS', `Fetched list of reviews`, req);
        
        return helper.success(res, `Successfully fetched list of reviews`, {
            data: rows,
            stats: {
                totalReviews,
                avgRating,
                pendingCount,
                approvedCount
            },
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error loading reviews:`, error);
        return helper.error(res, 'Server error loading reviews', 500);
    }
};

const getReview = async (req, res) => {
    try {
        const review = await Review.findOne({
            where: { id: req.params.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }
            ]
        });
        if (!review) {
            return helper.error(res, "Review not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_REVIEW', `Review details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Review found", review, 200);
    } catch (error) {
        console.error("Error loading review:", error);
        return helper.error(res, "Server error loading review", 500);
    }
};

const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return helper.error(res, "Review not found", 404);
        }

        await review.update({ status });
        await logActivity(req.user.id, 'UPDATE_REVIEW_STATUS', `Updated review status to ${status} for ID ${req.params.id}`, req);
        return helper.success(res, `Review status updated to ${status}`, review, 200);
    } catch (error) {
        console.error("Error updating review status:", error);
        return helper.error(res, "Server error updating review status", 500);
    }
};

const deleteReview = async (req, res) => {
    try {
        const reviewItem = await Review.findOne({ where: { id: req.params.id } });
        if (!reviewItem) {
            return helper.error(res, "Review not found", 404);
        }
        await reviewItem.destroy();
        await logActivity(req.user.id, 'DELETE_REVIEW', `Review deleted for ID ${req.params.id}`, req);
        return helper.success(res, "Review deleted successfully", {}, 200);
    } catch (error) {
        console.error("Error deleting review:", error);
        return helper.error(res, "Server error deleting review", 500);
    }
};

module.exports = {
    getReviewsList,
    getReview,
    updateReviewStatus,
    deleteReview
};