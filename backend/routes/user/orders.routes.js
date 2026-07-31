const express = require('express');
const router = express.Router();
const userOrdersController = require('../../controller/user/orders.controller');
const { authentication } = require('../../middleware/auth');

const placeOrderController = require('../../controller/user/place.order.controller');

router.get('/', authentication, userOrdersController.getUserOrders);
router.get('/:id', authentication, userOrdersController.getUserOrderById);
router.post('/:id/return', authentication, userOrdersController.requestOrderReturn);
router.post('/place', authentication, placeOrderController.placeOrder);

module.exports = router;
