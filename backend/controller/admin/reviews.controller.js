const db = require("../../models");
const helper = require("../../helper/helper");
const { Review, User, Product, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_reviews', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getReviewsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const ratingFilter = req.query.rating || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ review: { $regex: search, $options: 'i' } }];
    if (statusFilter && statusFilter !== 'all') query.status = statusFilter;
    if (ratingFilter && ratingFilter !== 'all') query.rating = parseInt(ratingFilter);

    const [rows, count, totalReviews, pendingCount, approvedCount] = await Promise.all([
      Review.find(query).populate('user_id', 'id name email').populate('product_id', 'id name slug').sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Review.countDocuments(query),
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'approved' })
    ]);

    const ratingAgg = await Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
    const avgRating = ratingAgg[0] ? ratingAgg[0].avg.toFixed(1) : '0.0';

    const rowsWithData = rows.map(r => ({ ...r, user: r.user_id, product: r.product_id }));

    await logActivity(req.user._id, 'VIEW_REVIEWS', 'Fetched list of reviews', req);
    return helper.success(res, 'Successfully fetched list of reviews', {
      data: rowsWithData,
      stats: { totalReviews, avgRating, pendingCount, approvedCount },
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading reviews', 500); }
};

const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user_id', 'id name email').populate('product_id', 'id name slug').lean({ virtuals: true });
    if (!review) return helper.error(res, "Review not found", 404);
    await logActivity(req.user._id, 'VIEW_REVIEW', `Review viewed for ID ${req.params.id}`, req);
    return helper.success(res, "Review found", { ...review, user: review.user_id, product: review.product_id }, 200);
  } catch (e) { return helper.error(res, "Server error loading review", 500); }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return helper.error(res, "Review not found", 404);
    review.status = status;
    await review.save();
    await logActivity(req.user._id, 'UPDATE_REVIEW_STATUS', `Review status updated to ${status}`, req);
    return helper.success(res, `Review status updated to ${status}`, review, 200);
  } catch (e) { return helper.error(res, "Server error updating review status", 500); }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return helper.error(res, "Review not found", 404);
    await Review.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_REVIEW', `Review deleted for ID ${req.params.id}`, req);
    return helper.success(res, "Review deleted successfully", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting review", 500); }
};

module.exports = { getReviewsList, getReview, updateReviewStatus, deleteReview };