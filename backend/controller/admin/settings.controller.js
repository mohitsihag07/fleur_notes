const db = require("../../models");
const helper = require("../../helper/helper");
const { Setting, AuditLog, Newsletter } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_settings', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const DEFAULT_SETTINGS = {
  site_name: '',
  site_tagline: '',
  contact_email: '',
  contact_phone: '',
  store_address: '',
  business_hours: '',
  currency: '',
  tax_rate: '',
  flat_shipping_rate: '',
  free_shipping_threshold: '',
  enable_free_shipping: '',
  enable_stripe: '',
  enable_cod: '',
  stripe_public_key: '',
  instagram_url: '',
  facebook_url: '',
  pinterest_url: '',
  newsletter_title: '',
  newsletter_subtitle: ''
};

const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.find().lean();
    const settingsMap = { ...DEFAULT_SETTINGS };
    settingsList.forEach(s => { settingsMap[s.key] = s.value; });
    return helper.success(res, "Successfully fetched system settings", settingsMap, 200);
  } catch (e) { console.error("Error loading settings:", e); return helper.error(res, "Server error loading settings", 500); }
};

const updateSettings = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) payload.site_logo = `/images/settings/${req.file.filename}`;

    for (const [key, value] of Object.entries(payload)) {
      const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await Setting.findOneAndUpdate({ key }, { key, value: stringVal, type: 'string', group: 'general' }, { upsert: true, new: true });
    }

    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_SETTINGS', 'Updated system configuration settings', req);
    }

    const updatedList = await Setting.find().lean();
    const updatedMap = { ...DEFAULT_SETTINGS };
    updatedList.forEach(s => { updatedMap[s.key] = s.value; });
    return helper.success(res, "System settings updated successfully", updatedMap, 200);
  } catch (e) { console.error("Error updating settings:", e); return helper.error(res, "Server error updating settings", 500); }
};

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return helper.error(res, "Please provide a valid email address", 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: cleanEmail });
    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        existing.unsubscribed_at = null;
        await existing.save();
      }
      return helper.success(res, "You are already subscribed to our newsletter!", existing, 200);
    }

    const subscription = await Newsletter.create({
      email: cleanEmail,
      is_active: true
    });

    return helper.success(res, "Successfully subscribed to newsletter!", subscription, 201);
  } catch (e) {
    console.error("Error subscribing to newsletter:", e);
    return helper.error(res, "Server error subscribing to newsletter", 500);
  }
};

module.exports = { getSettings, updateSettings, subscribeNewsletter };
