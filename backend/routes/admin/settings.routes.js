const express = require("express");
const router = express.Router();
const settingsController = require("../../controller/admin/settings.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadSingle } = require("../../helper/fileupload");

router.use(authenticateAdmin);

router.get("/", settingsController.getSettings);
router.put("/", uploadSingle('logo', 'settings'), settingsController.updateSettings);
router.post("/", uploadSingle('logo', 'settings'), settingsController.updateSettings);

module.exports = router;
