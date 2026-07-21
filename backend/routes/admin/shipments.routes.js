const express = require("express");
const router = express.Router();
const shipmentsController = require("../../controller/admin/shipments.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", shipmentsController.getShipmentsList);
router.get("/:id", shipmentsController.getShipment);
router.put("/update/:id", shipmentsController.updateShipment);

module.exports = router;
