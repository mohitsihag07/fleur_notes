const express = require('express');
const router = express.Router();
const userOrdersController = require('../../controller/user/orders.controller');
const { authentication } = require('../../middleware/auth');

router.get('/', authentication, userOrdersController.getUserOrders);

module.exports = router;
