const express = require("express");
const router = express.Router();
const userController = require("../../controller/admin/user.controller");
const { authenticateAdmin } = require("../../middleware/auth");

// Require admin authentication for all user management routes
router.use(authenticateAdmin);

router.get("/", userController.getUsersList);
router.get("/:id", userController.getUser);
router.put("/:id/status", userController.userStatusUpdate);
router.delete("/:id", userController.deleteUser);

module.exports = router;
