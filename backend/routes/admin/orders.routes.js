const express = require("express");
const router = express.Router();
const ordersController = require("../../controller/admin/orders.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", ordersController.getOrdersList);
router.get("/:id", ordersController.getOrder);
router.put("/update-status/:id", ordersController.updateOrderStatus);

module.exports = router;
