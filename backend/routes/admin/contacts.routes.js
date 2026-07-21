const express = require("express");
const router = express.Router();
const contactsController = require("../../controller/admin/contacts.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", contactsController.getContactsList);
router.get("/:id", contactsController.getContact);
router.post("/reply/:id", contactsController.replyContactMessage);
router.delete("/delete/:id", contactsController.deleteContact);

module.exports = router;
