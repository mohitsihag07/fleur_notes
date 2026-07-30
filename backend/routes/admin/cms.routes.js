const express = require("express");
const router = express.Router();
const cmsController = require("../../controller/admin/cms.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadFields } = require("../../helper/fileupload");

router.use(authenticateAdmin);

const cmsUpload = uploadFields(
  [{ name: 'image', maxCount: 1 }, { name: 'values_section_image', maxCount: 1 }],
  'cms'
);

router.get("/", cmsController.getCmsPagesList);
router.get("/:slug", cmsController.getCmsBySlug);
router.put("/:slug", cmsUpload, cmsController.updateCmsBySlug);
router.post("/:slug", cmsUpload, cmsController.updateCmsBySlug);

module.exports = router;
