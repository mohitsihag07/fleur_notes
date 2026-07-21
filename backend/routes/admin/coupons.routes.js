const express = require("express");
const router = express.Router();
const couponsController = require("../../controller/admin/coupons.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", couponsController.getCouponsList);
router.get("/:id", couponsController.getCoupon);
router.post("/add", couponsController.addCoupon);
router.put("/update/:id", couponsController.updateCoupon);
router.put("/update-status/:id", couponsController.updateCouponStatus);
router.delete("/delete/:id", couponsController.deleteCoupon);

module.exports = router;
