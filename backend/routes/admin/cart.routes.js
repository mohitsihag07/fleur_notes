const express = require("express");
const router = express.Router();
const cartController = require("../../controller/admin/cart.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", cartController.getCartsList);
router.get("/:id", cartController.getCart);

module.exports = router;
