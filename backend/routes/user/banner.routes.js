const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/user/banner.controller");

router.get("/", bannerController.getBannersList);
router.get("/:id", bannerController.getBanner);

module.exports = router;
