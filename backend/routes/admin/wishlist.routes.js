const express = require("express");
const router = express.Router();
const wishlistController = require("../../controller/admin/wishlist.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", wishlistController.getWishlistsList);
router.get("/:id", wishlistController.getWishlist);

module.exports = router;
