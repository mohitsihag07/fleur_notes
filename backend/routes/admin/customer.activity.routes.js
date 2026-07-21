const express = require("express");
const router = express.Router();
const customerActivityController = require("../../controller/admin/customer.activity.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", customerActivityController.getCustomerActivity);
router.get("/count", customerActivityController.getCustomerActivityCount);

module.exports = router;
