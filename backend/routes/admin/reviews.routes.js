const express = require("express");
const router = express.Router();
const reviewsController = require("../../controller/admin/reviews.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", reviewsController.getReviewsList);
router.get("/:id", reviewsController.getReview);
router.put("/:id/status", reviewsController.updateReviewStatus);
router.delete("/delete/:id", reviewsController.deleteReview);

module.exports = router;
