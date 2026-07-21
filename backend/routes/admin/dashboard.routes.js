const express = require("express");
const router = express.Router();
const dashboardController = require("../../controller/admin/dashboard.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.get("/", authenticateAdmin, dashboardController.dashboard);

module.exports = router;
