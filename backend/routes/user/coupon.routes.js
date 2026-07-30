const express = require('express');
const router = express.Router();
const userCouponController = require('../../controller/user/coupon.controller');

router.get('/', userCouponController.getActiveCoupons);

module.exports = router;
