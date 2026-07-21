const express = require("express");
const router = express.Router();
const paymentController = require("../../controller/admin/payment.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", paymentController.getPaymentsList);
router.get("/:id", paymentController.getPayment);
router.post("/refund/:id", paymentController.refundPayment);

module.exports = router;
