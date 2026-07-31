const express = require('express');
const router = express.Router();
const userCartController = require('../../controller/user/cart.controller');
const { authentication } = require('../../middleware/auth');

router.get('/', authentication, userCartController.getCart);
router.post('/add', authentication, userCartController.addToCart);
router.put('/update', authentication, userCartController.updateCartItem);
router.delete('/remove/:productId', authentication, userCartController.removeFromCart);
router.delete('/clear', authentication, userCartController.clearCart);
router.post('/sync', authentication, userCartController.syncCart);

module.exports = router;
