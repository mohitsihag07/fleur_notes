const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const helper = require("../../helper/helper");
const { User, UserProfile } = db;

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, gender, date_of_birth, profile_picture, password } = req.body;

    if (!name || !name.trim()) return helper.error(res, "Full name is required", 400);
    if (!email || !email.trim()) return helper.error(res, "Email address is required", 400);
    if (!password || !password.trim()) return helper.error(res, "Password is required", 400);

    const cleanEmail = email.trim().toLowerCase();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.is_email_verified) {
      return helper.error(res, "An account with this email address already exists.", 400);
    }

    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : null;
    if (cleanPhone) {
      const existingPhoneUser = await User.findOne({ phone: cleanPhone, email: { $ne: cleanEmail } });
      if (existingPhoneUser && existingPhoneUser.is_email_verified) {
        return helper.error(res, "An account with this phone number already exists.", 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);
    const generatedOtp = "123456";
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    let user;
    if (existingUser && !existingUser.is_email_verified) {
      user = existingUser;
      user.name = name.trim();
      user.password = hashedPassword;
      user.phone = cleanPhone;
      user.otp = generatedOtp;
      user.otp_expires_at = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: 'user',
        status: 'active',
        otp: generatedOtp,
        otp_expires_at: otpExpires,
        is_email_verified: false,
        is_phone_verified: false
      });
    }

    let profile = await UserProfile.findOne({ user_id: user._id });
    if (!profile) {
      profile = await UserProfile.create({ user_id: user._id });
    }
    if (gender) {
      const g = typeof gender === 'string' ? gender.trim().toLowerCase() : null;
      profile.gender = ['male', 'female', 'other'].includes(g) ? g : null;
    }
    if (date_of_birth) profile.date_of_birth = new Date(date_of_birth);
    if (profile_picture) profile.profile_picture = profile_picture;
    await profile.save();

    return helper.success(res, `OTP verification code sent to ${cleanEmail}`, {
      email: cleanEmail,
      otp: generatedOtp
    }, 200);
  } catch (error) {
    console.error("Register Error:", error);
    return helper.error(res, error.message || "Server error during registration", 500);
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !email.trim()) return helper.error(res, "Email address is required", 400);
    if (!otp || !otp.trim()) return helper.error(res, "OTP code is required", 400);

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return helper.error(res, "User record not found. Please register first.", 404);
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      return helper.error(res, "Your account has been suspended. Please contact support.", 403);
    }

    if (!user.otp || user.otp.toString() !== otp.trim().toString()) {
      return helper.error(res, "Invalid OTP code entered. Please try again.", 400);
    }

    user.is_email_verified = true;
    user.is_phone_verified = true;
    user.otp = null;
    user.otp_expires_at = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'caflore_secret_jwt_key_2026',
      { expiresIn: "30d" }
    );

    const profile = await UserProfile.findOne({ user_id: user._id });

    return helper.success(res, "Email verified & account created successfully!", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: true,
        is_phone_verified: true,
        gender: profile ? profile.gender : null,
        date_of_birth: profile ? profile.date_of_birth : null,
        address: profile ? profile.bio : null,
        profile_picture: profile ? profile.profile_picture : null
      },
      token
    }, 200);
  } catch (error) {
    console.error("Verify Email OTP Error:", error);
    return helper.error(res, "Failed to verify OTP", 500);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim()) return helper.error(res, "Email address is required", 400);
    if (!password || !password.trim()) return helper.error(res, "Password is required", 400);

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return helper.error(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return helper.error(res, "Invalid email or password", 401);
    }

    // Only allow regular users to authenticate via this endpoint
    if (user.role !== 'user') {
      return helper.error(res, "Access denied. Please use the appropriate login portal.", 403);
    }

    // Require user status to be explicitly active
    if (user.status !== 'active') {
      return helper.error(res, "Your account is not active. Please contact support.", 403);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'caflore_secret_jwt_key_2026',
      { expiresIn: "30d" }
    );

    const profile = await UserProfile.findOne({ user_id: user._id });

    return helper.success(res, "Signed in successfully!", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: Boolean(user.is_email_verified),
        is_phone_verified: Boolean(user.is_phone_verified),
        gender: profile ? profile.gender : null,
        date_of_birth: profile ? profile.date_of_birth : null,
        address: profile ? profile.bio : null,
        profile_picture: profile ? profile.profile_picture : null
      },
      token
    }, 200);
  } catch (error) {
    console.error("Login Error:", error);
    return helper.error(res, error.message || "Server error during login", 500);
  }
};

const sendOtp = async (req, res) => {
  try {
    let { phone, type } = req.body;
    if (!phone || !phone.trim()) {
      return helper.error(res, "Mobile phone number is required", 400);
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return helper.error(res, "Please enter a valid 10-digit mobile number", 400);
    }

    const generatedOtp = "123456";
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone: cleanPhone });

    if (type === 'login') {
      if (!user) {
        return helper.error(res, "This phone number is not registered. Please sign up first.", 400);
      }
      if (user.role !== 'user') {
        return helper.error(res, "Access denied. Please use the appropriate login portal.", 403);
      }
      if (user.status !== 'active') {
        return helper.error(res, "Your account is not active. Please contact support.", 403);
      }
      user.otp = generatedOtp;
      user.otp_expires_at = otpExpires;
      await user.save();
    } else if (type === 'register') {
      if (user) {
        return helper.error(res, "An account with this phone number already exists. Please sign in instead.", 400);
      }
      user = await User.create({
        phone: cleanPhone,
        role: 'user',
        status: 'active',
        otp: generatedOtp,
        otp_expires_at: otpExpires
      });
      await UserProfile.create({ user_id: user._id });
    } else {
      if (!user) {
        user = await User.create({
          phone: cleanPhone,
          role: 'user',
          status: 'active',
          otp: generatedOtp,
          otp_expires_at: otpExpires
        });
        await UserProfile.create({ user_id: user._id });
      } else {
        user.otp = generatedOtp;
        user.otp_expires_at = otpExpires;
        await user.save();
      }
    }

    return helper.success(res, `OTP sent successfully to +91 ${cleanPhone}`, {
      phone: cleanPhone,
      otp: generatedOtp
    }, 200);
  } catch (error) {
    console.error("Send OTP Error:", error);
    return helper.error(res, "Failed to send OTP. Please try again.", 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    let { phone, otp, name } = req.body;
    if (!phone || !phone.trim()) return helper.error(res, "Phone number is required", 400);
    if (!otp || !otp.trim()) return helper.error(res, "OTP verification code is required", 400);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return helper.error(res, "User record not found. Please request a new OTP.", 404);
    }

    if (user.role !== 'user') {
      return helper.error(res, "Access denied. Please use the appropriate login portal.", 403);
    }
    if (user.status !== 'active') {
      return helper.error(res, "Your account is not active. Please contact support.", 403);
    }

    if (!user.otp || user.otp.toString() !== otp.trim().toString()) {
      return helper.error(res, "Invalid OTP code entered. Please try again.", 400);
    }

    user.is_phone_verified = true;
    user.is_email_verified = true;
    user.otp = null;
    user.otp_expires_at = null;
    if (name && name.trim()) {
      user.name = name.trim();
    }
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'caflore_secret_jwt_key_2026',
      { expiresIn: "30d" }
    );

    const profile = await UserProfile.findOne({ user_id: user._id });

    return helper.success(res, "Phone verified & signed in successfully!", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: true,
        is_phone_verified: true,
        gender: profile ? profile.gender : null,
        date_of_birth: profile ? profile.date_of_birth : null,
        address: profile ? profile.bio : null,
        profile_picture: profile ? profile.profile_picture : null
      },
      token
    }, 200);
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return helper.error(res, "Failed to verify OTP", 500);
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return helper.error(res, "User not found", 404);

    const profile = await UserProfile.findOne({ user_id: user._id });
    return helper.success(res, "User session data", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: Boolean(user.is_email_verified),
        is_phone_verified: Boolean(user.is_phone_verified),
        gender: profile ? profile.gender : null,
        date_of_birth: profile ? profile.date_of_birth : null,
        address: profile ? profile.bio : null,
        profile_picture: profile ? profile.profile_picture : null
      }
    }, 200);
  } catch (error) {
    return helper.error(res, "Server error fetching user session", 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, gender, date_of_birth, address, profile_picture } = req.body;

    const user = await User.findById(userId);
    if (!user) return helper.error(res, "User not found", 404);

    if (name && name.trim()) user.name = name.trim();
    await user.save();

    let profile = await UserProfile.findOne({ user_id: userId });
    if (!profile) {
      profile = await UserProfile.create({ user_id: userId });
    }

    if (gender !== undefined) {
      const g = typeof gender === 'string' ? gender.trim().toLowerCase() : null;
      profile.gender = g ? (['male', 'female', 'other'].includes(g) ? g : null) : null;
    }
    if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
    if (address !== undefined) profile.bio = address;
    if (profile_picture !== undefined) profile.profile_picture = profile_picture;
    await profile.save();

    return helper.success(res, "Profile updated successfully!", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: Boolean(user.is_email_verified),
        is_phone_verified: Boolean(user.is_phone_verified),
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        address: profile.bio,
        profile_picture: profile.profile_picture
      }
    }, 200);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return helper.error(res, "Failed to update profile", 500);
  }
};

module.exports = {
  registerUser,
  verifyEmailOtp,
  loginUser,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile
};
