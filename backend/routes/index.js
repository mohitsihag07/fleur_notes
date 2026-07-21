var express = require('express');
var router = express.Router();
const authRouter = require('./admin/auth.routes');
const dashboardRouter = require('./admin/dashboard.routes');
const userRouter = require('./admin/user.routes');
const categoryRouter = require('./admin/category.routes');
const bannerRouter = require('./admin/banner.routes');
const productRouter = require('./admin/product.routes');
const cartRouter = require('./admin/cart.routes');
const contactRouter = require('./admin/contacts.routes');
const couponRouter = require('./admin/coupons.routes');
const customerActivityRouter = require('./admin/customer.activity.routes');
const faqRouter = require('./admin/faqs.routes');
const newsletterRouter = require('./admin/newsletters.routes');
const cmsRouter = require('./admin/cms.routes');
const settingRouter = require('./admin/settings.routes');
const notificationRouter = require('./admin/notifications.routes');
const orderRouter = require('./admin/orders.routes');
const paymentRouter = require('./admin/payment.routes');
const reviewRouter = require('./admin/reviews.routes');
const shipmentRouter = require('./admin/shipments.routes');
const wishlistRouter = require('./admin/wishlist.routes');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/banners', bannerRouter);
router.use('/products', productRouter);
router.use('/carts', cartRouter);
router.use('/cms', cmsRouter);
router.use('/contacts', contactRouter);
router.use('/coupons', couponRouter);
router.use('/customer-activities', customerActivityRouter);
router.use('/faqs', faqRouter);
router.use('/newsletters', newsletterRouter);
router.use('/notifications', notificationRouter);
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/reviews', reviewRouter);
router.use('/settings', settingRouter);
router.use('/shipments', shipmentRouter);
router.use('/wishlists', wishlistRouter);

module.exports = router;
