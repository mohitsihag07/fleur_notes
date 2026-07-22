var express = require('express');
var router = express.Router();

const bannerRouter = require('./user/banner.routes');
const categoryRouter = require('./user/category.routes');
const supportChatRouter = require('./user/supportChat.routes');
const productRouter = require('./user/product.routes');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.use('/banners', bannerRouter);
router.use('/support-chat', supportChatRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter)

module.exports = router;
