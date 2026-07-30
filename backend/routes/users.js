var express = require('express');
var router = express.Router();

const bannerRouter = require('./user/banner.routes');
const categoryRouter = require('./user/category.routes');
const supportChatRouter = require('./user/supportChat.routes');
const productRouter = require('./user/product.routes');
const settingRouter = require('./admin/settings.routes');
const faqRouter = require('./user/faq.routes');
const cmsRouter = require('./user/cms.routes');
const authRouter = require('./user/auth.routes');
const orderRouter = require('./user/orders.routes');
const couponRouter = require('./user/coupon.routes');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource')
});

router.use('/banners', bannerRouter);
router.use('/support-chat', supportChatRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/settings', settingRouter);
router.use('/faqs', faqRouter);
router.use('/cms', cmsRouter);
router.use('/auth', authRouter);
router.use('/orders', orderRouter);
router.use('/coupons', couponRouter);

module.exports = router;
