const express = require("express");
const router = express.Router();
const faqController = require("../../controller/user/faq.controller");

router.get("/", faqController.getPublicFAQs);

module.exports = router;
