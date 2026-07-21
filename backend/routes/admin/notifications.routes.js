const express = require("express");
const router = express.Router();
const notificationsController = require("../../controller/admin/notifications.controller");
const { authenticateAdmin } = require("../../middleware/auth");

router.use(authenticateAdmin);

router.get("/", notificationsController.getNotificationsList);
router.get("/:id", notificationsController.getNotification);
router.post("/push", notificationsController.pushNotification);
router.delete("/delete/:id", notificationsController.deleteNotification);

module.exports = router;
