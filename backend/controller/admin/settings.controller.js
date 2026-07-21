const db = require("../../models");
const helper = require("../../helper/helper");
const { Setting, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_settings',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Default settings fallback map
const DEFAULT_SETTINGS = {
  // General Store Info
  site_name: 'Fleur Notes',
  site_tagline: 'Handcrafted Stationery & Gifts',
  contact_email: 'hello@fleurnotes.com',
  contact_phone: '+1 (800) 555-0199',
  store_address: '123 Blossom Avenue, Suite 400, New York, NY 10001',
  currency: 'INR (₹)',
  tax_rate: '18',
  
  // Shipping Settings
  flat_shipping_rate: '10.00',
  free_shipping_threshold: '100.00',
  enable_free_shipping: 'true',
  
  // Payment Settings
  enable_stripe: 'true',
  enable_cod: 'true',
  stripe_public_key: 'pk_test_sample_fleur_notes',

  // Social Links
  instagram_url: 'https://instagram.com/fleurnotes',
  facebook_url: 'https://facebook.com/fleurnotes',
  pinterest_url: 'https://pinterest.com/fleurnotes'
};

const getSettings = async (req, res) => {
    try {
        const settingsList = await Setting.findAll();
        
        // Convert to key-value object map
        const settingsMap = { ...DEFAULT_SETTINGS };
        settingsList.forEach((s) => {
            settingsMap[s.key] = s.value;
        });

        return helper.success(res, "Successfully fetched system settings", settingsMap, 200);
    } catch (error) {
        console.error("Error loading settings:", error);
        return helper.error(res, "Server error loading settings", 500);
    }
};

const updateSettings = async (req, res) => {
    try {
        const payload = { ...req.body };

        // Handle logo file upload if present
        if (req.file) {
            payload.site_logo = `/images/settings/${req.file.filename}`;
        }

        // Upsert each key in payload
        for (const [key, value] of Object.entries(payload)) {
            let settingItem = await Setting.findOne({ where: { key } });
            const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);

            if (settingItem) {
                await settingItem.update({ value: stringVal });
            } else {
                await Setting.create({
                    key,
                    value: stringVal,
                    type: 'string',
                    group: 'general'
                });
            }
        }

        await logActivity(req.user.id, 'UPDATE_SETTINGS', `Updated system configuration settings`, req);
        
        // Fetch updated settings
        const updatedList = await Setting.findAll();
        const updatedMap = { ...DEFAULT_SETTINGS };
        updatedList.forEach((s) => {
            updatedMap[s.key] = s.value;
        });

        return helper.success(res, "System settings updated successfully", updatedMap, 200);
    } catch (error) {
        console.error("Error updating settings:", error);
        return helper.error(res, "Server error updating settings", 500);
    }
};

module.exports = {
    getSettings,
    updateSettings
};
