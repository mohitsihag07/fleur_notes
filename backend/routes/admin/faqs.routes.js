const express = require("express");
const router = express.Router();
const faqsController = require("../../controller/admin/faqs.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", faqsController.getFAQsList);
router.get("/:id", faqsController.getFAQ);
router.post("/add", faqsController.createFAQ);
router.put("/update/:id", faqsController.updateFAQ);
router.delete("/delete/:id", faqsController.deleteFAQ);

module.exports = router;
