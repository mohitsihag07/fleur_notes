const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/admin/banner.controller");
const { authenticateAdmin } = require("../../middleware/auth");

const { uploadSingle } = require("../../helper/fileupload");

router.use(authenticateAdmin);

router.get("/", bannerController.getBannersList);
router.post("/upload-image", uploadSingle("image", "banners"), bannerController.uploadBannerImage);
router.get("/:id", bannerController.getBanner);
router.post("/add", bannerController.addBanner);
router.put("/update/:id", bannerController.updateBanner);
router.put("/update-status/:id", bannerController.updateBannerStatus);
router.delete("/delete/:id", bannerController.deleteBanner);

module.exports = router;
