const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { sendEmail } = require("../../helper/nodemailer");
const { User, UserProfile, UserAddress, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_auth',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: { email, role: 'admin' }
        });
        if (!user) {
            return helper.error(res, "User not found", 404);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return helper.error(res, "Invalid credentials", 401);
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        const profile = await UserProfile.findOne({ where: { user_id: user.id } });
        return helper.success(res, "Login successful", {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_picture: profile ? profile.profile_picture : null
            },
            token
        }, 200);
    } catch (error) {
        return helper.error(res, error.message, 500);
    }
}

const verifySession = async (req, res) => {
  try {
    const user = req.user;
    const profile = await UserProfile.findOne({ where: { user_id: user.id } });
    return helper.success(res, "Session verified", {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_picture: profile ? profile.profile_picture : null
      }, 200);
  } catch (error) {
    return helper.error(res, "Server error verifying session", 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return helper.error(res, "Please provide email address", 400);
    }

    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user) {    
      return helper.success(res, "If email exists, a password reset instructions mail has been simulated", {}, 200);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000);
    await user.update({ otp, otp_expires_at: tokenExpiry });

    await sendEmail({
      to: email,
      subject: "Fleur Notes - Password Reset Verification Code",
      text: `Your password reset verification code is: ${otp}. It will expire in 20 minutes.`,
      html: `<p>Your password reset verification code is: <strong>${otp}</strong>.</p><p>It will expire in 20 minutes.</p>`
    });

    console.log(`[SMTP SIMULATOR] Sent password reset instructions to ${email}. Reset Code: ${otp}`);

    return helper.success(res, "A password reset instructions mail has been simulated. Check backend logs for the OTP.", { simulatedOtp: otp.toString() }, 200);
    
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return helper.error(res, "Server error requesting password reset", 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return helper.error(res, "Please provide email and verification code (OTP)", 400);
    }

    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user) {
      return helper.error(res, "Invalid admin email address", 404);
    }

    // Check OTP
    if (parseInt(user.otp) !== parseInt(otp)) {
      return helper.error(res, "Invalid verification code", 400);
    }

    // Check expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return helper.error(res, 'Verification code has expired. Please request a new one.', 400);
    }

    return helper.success(res, 'Verification code is valid.', {}, 200);
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return helper.error(res, 'Server error during OTP verification', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return helper.error(res, "Please provide email, verification code (OTP), and new password", 400);
    }

    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user) {
      return helper.error(res, "Invalid admin email address", 404);
    }

    // Check OTP
    if (parseInt(user.otp) !== parseInt(otp)) {
      return helper.error(res, "Invalid verification code", 400);
    }

    // Check expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return helper.error(res, 'Verification code has expired. Please request a new one.', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password, clear OTP and expiry
    await user.update({
      password: hashedPassword,
      otp: null,
      otp_expires_at: null
    });

    await logActivity(user.id, 'RESET_PASSWORD', 'Admin reset login password via verification code', req);

    return helper.success(res, 'Password reset successfully. You can now login with your new password.', {}, 200);
  } catch (error) {
    console.error('Reset Password Error:', error);
    return helper.error(res, 'Server error during password reset', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const profile = await UserProfile.findOne({
      where: { user_id: user.id }
    });
    const address = await UserAddress.findOne({
      where: { user_id: user.id }
    });
    return helper.success(res, "Profile retrieved successfully", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          country_code: user.country_code,
          is_active: user.is_active,
          is_email_verified: user.is_email_verified
        },
        profile: profile ? {
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          profile_picture: profile.profile_picture,
          bio: profile.bio
        } : null,
        address: address ? {
          full_name: address.full_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
          is_default: address.is_default,
          label: address.label
        } : null
      }, 200);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return helper.error(res, 'Server error retrieving profile', 500);
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return helper.error(res, "Please upload a profile picture file", 400);
    }
    const relativePath = `/images/${req.uploadFolder || 'profile'}/${req.file.filename}`;
    const user = req.user;

    // Immediately save/update profile picture in UserProfile model
    const [profile, created] = await UserProfile.findOrCreate({
      where: { user_id: user.id },
      defaults: { profile_picture: relativePath }
    });

    if (!created) {
      await profile.update({ profile_picture: relativePath });
    }

    return helper.success(res, "Profile picture uploaded successfully", { url: relativePath }, 200);
  } catch (error) {
    console.error('Upload Profile Image Error:', error);
    return helper.error(res, 'Server error uploading profile picture: ' + error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      country_code, 
      bio, 
      gender, 
      dob, 
      profile_picture, 
      address, 
      city, 
      state, 
      country, 
      postal_code 
    } = req.body;
    const user = req.user;

    const trimmedName = typeof name === 'string' ? name.trim() : name;
    const trimmedEmail = typeof email === 'string' ? email.trim() : email;
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : phone;
    const trimmedCountryCode = typeof country_code === 'string' ? country_code.trim() : country_code;
    const trimmedBio = typeof bio === 'string' ? bio.trim() : bio;
    const trimmedGender = typeof gender === 'string' ? gender.trim() : gender;
    const trimmedDob = typeof dob === 'string' ? dob.trim() : dob;
    const trimmedProfilePicture = typeof profile_picture === 'string' ? profile_picture.trim() : profile_picture;
    const trimmedAddress = typeof address === 'string' ? address.trim() : address;
    const trimmedCity = typeof city === 'string' ? city.trim() : city;
    const trimmedState = typeof state === 'string' ? state.trim() : state;
    const trimmedCountry = typeof country === 'string' ? country.trim() : country;
    const trimmedPostalCode = typeof postal_code === 'string' ? postal_code.trim() : postal_code;

    if (!trimmedName || !trimmedEmail) {
      return helper.error(res, 'Name and email are required fields', 400);
    }

    if (trimmedDob) {
      const birthDate = new Date(trimmedDob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 15) {
        return helper.error(res, 'You must be at least 15 years old.', 400);
      }
    }

    if (trimmedPhone) {
      if (!/^\d+$/.test(trimmedPhone)) {
        return helper.error(res, 'Phone number must contain only numbers.', 400);
      }
      if (trimmedPhone.length < 8) {
        return helper.error(res, 'Phone number must be at least 8 digits.', 400);
      }
    }

    // Check if email already in use
    const emailCheck = await User.findOne({
      where: {
        email: trimmedEmail,
        id: { [Op.ne]: user.id }
      },
      paranoid: false
    });

    if (emailCheck) {
      return helper.error(res, 'Email address is already in use by another account', 400);
    }

    // Update main User fields
    await user.update({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || user.phone,
      country_code: trimmedCountryCode !== undefined ? trimmedCountryCode : user.country_code
    });

    // Update or create UserProfile (gender, date_of_birth, profile_picture, bio)
    const [profile, profileCreated] = await UserProfile.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        gender: trimmedGender || null,
        date_of_birth: trimmedDob || null,
        profile_picture: trimmedProfilePicture || null,
        bio: trimmedBio || null
      }
    });

    if (!profileCreated) {
      await profile.update({
        gender: trimmedGender !== undefined ? (trimmedGender || null) : profile.gender,
        date_of_birth: trimmedDob !== undefined ? (trimmedDob || null) : profile.date_of_birth,
        profile_picture: trimmedProfilePicture !== undefined ? (trimmedProfilePicture || null) : profile.profile_picture,
        bio: trimmedBio !== undefined ? (trimmedBio || null) : profile.bio
      });
    }

    // Update or create UserAddress record
    const [addressRecord, addressCreated] = await UserAddress.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        full_name: trimmedName,
        phone: trimmedPhone || '0000000000',
        address_line1: trimmedAddress || '',
        city: trimmedCity || '',
        state: trimmedState || '',
        pincode: trimmedPostalCode || '',
        country: trimmedCountry || 'India',
        is_default: true,
        label: 'work'
      }
    });

    if (!addressCreated) {
      await addressRecord.update({
        full_name: trimmedName,
        phone: trimmedPhone !== undefined ? (trimmedPhone || addressRecord.phone) : addressRecord.phone,
        address_line1: trimmedAddress !== undefined ? trimmedAddress : addressRecord.address_line1,
        city: trimmedCity !== undefined ? trimmedCity : addressRecord.city,
        state: trimmedState !== undefined ? trimmedState : addressRecord.state,
        pincode: trimmedPostalCode !== undefined ? trimmedPostalCode : addressRecord.pincode,
        country: trimmedCountry !== undefined ? trimmedCountry : addressRecord.country
      });
    }

    await logActivity(user.id, 'UPDATE_PROFILE', 'Admin updated profile details', req);

    return helper.success(res, 'Profile details updated successfully', {
      success: true,
      message: 'Profile details updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country_code: user.country_code,
        role: user.role,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        profile_picture: profile.profile_picture,
        bio: profile.bio,
        address: addressRecord.address_line1,
        city: addressRecord.city,
        state: addressRecord.state,
        country: addressRecord.country,
        postal_code: addressRecord.pincode
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return helper.error(res, 'Server error updating profile', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !currentPassword.trim() || !newPassword || !newPassword.trim()) {
      return helper.error(res, 'Provide current and new password', 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return helper.error(res, 'Incorrect current password', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    await user.update({ password: hashedPassword });

    await logActivity(user.id, 'CHANGE_PASSWORD', 'Admin updated login password', req);

    return helper.success(res, 'Password updated successfully', {}, 200);
  } catch (error) {
    return helper.error(res, 'Server error updating password', 500);
  }
};

module.exports = {
    adminLogin,
    verifySession,
    forgotPassword,
    forgetPassword: forgotPassword,
    verifyOtp,
    resetPassword,
    getProfile,
    uploadProfileImage,
    updateProfile,
    changePassword
};

