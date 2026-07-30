const express = require("express");
const router = express.Router();
const settingsController = require("../../controller/admin/settings.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadSingle } = require("../../helper/fileupload");

// Public GET settings (for website & admin panel logo, site info, etc.)
router.get("/public", settingsController.getSettings);
router.get("/", settingsController.getSettings);

// Public newsletter subscription
router.post("/subscribe", settingsController.subscribeNewsletter);

// Admin-only updates
router.put("/", authenticateAdmin, uploadSingle('logo', 'settings'), settingsController.updateSettings);
router.post("/", authenticateAdmin, uploadSingle('logo', 'settings'), settingsController.updateSettings);

module.exports = router;
