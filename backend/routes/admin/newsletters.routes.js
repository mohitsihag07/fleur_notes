const express = require("express");
const router = express.Router();
const newslettersController = require("../../controller/admin/newsletters.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", newslettersController.getNewslettersList);
router.put("/toggle/:id", newslettersController.toggleNewsletterSubscription);
router.delete("/delete/:id", newslettersController.deleteNewsletter);

module.exports = router;
