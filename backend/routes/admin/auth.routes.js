const express = require("express");
const router = express.Router();
const adminAuth = require("../../controller/admin/auth.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadSingle } = require("../../helper/fileupload");

// Public admin auth routes
router.post("/login", adminAuth.adminLogin);
router.post("/forget-password", adminAuth.forgetPassword);
router.post("/verify-otp", adminAuth.verifyOtp);
router.post("/reset-password", adminAuth.resetPassword);

// Authenticated admin routes
router.get("/verify-session", authenticateAdmin, adminAuth.verifySession);
router.get("/profile", authenticateAdmin, adminAuth.getProfile);
router.put("/profile", authenticateAdmin, adminAuth.updateProfile);
router.put("/change-password", authenticateAdmin, adminAuth.changePassword);
router.post("/upload-image", authenticateAdmin, uploadSingle("profile_picture", "profile"), adminAuth.uploadProfileImage);

module.exports = router;