const express = require("express");
const router = express.Router();
const cmsController = require("../../controller/admin/cms.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadSingle } = require("../../helper/fileupload");

router.use(authenticateAdmin);

router.get("/", cmsController.getCmsPagesList);
router.get("/:slug", cmsController.getCmsBySlug);
router.put("/:slug", uploadSingle('image', 'cms'), cmsController.updateCmsBySlug);
router.post("/:slug", uploadSingle('image', 'cms'), cmsController.updateCmsBySlug);

module.exports = router;
