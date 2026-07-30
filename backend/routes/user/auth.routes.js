const express = require('express');
const router = express.Router();
const userAuthController = require('../../controller/user/auth.controller');
const { authentication } = require('../../middleware/auth');

router.post('/register', userAuthController.registerUser);
router.post('/verify-email-otp', userAuthController.verifyEmailOtp);
router.post('/login', userAuthController.loginUser);
router.post('/send-otp', userAuthController.sendOtp);
router.post('/verify-otp', userAuthController.verifyOtp);
router.get('/me', authentication, userAuthController.getMe);
router.put('/profile', authentication, userAuthController.updateProfile);

module.exports = router;
