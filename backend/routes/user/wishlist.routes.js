const express = require('express');
const router = express.Router();
const userWishlistController = require('../../controller/user/wishlist.controller');
const { authentication } = require('../../middleware/auth');

router.get('/', authentication, userWishlistController.getWishlist);
router.post('/toggle', authentication, userWishlistController.toggleWishlist);
router.delete('/remove/:productId', authentication, userWishlistController.removeFromWishlist);
router.delete('/clear', authentication, userWishlistController.clearWishlist);
router.post('/sync', authentication, userWishlistController.syncWishlist);

module.exports = router;
