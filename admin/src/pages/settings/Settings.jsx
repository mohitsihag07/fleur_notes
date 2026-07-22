import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiShoppingBag, 
  FiTruck, 
  FiCreditCard, 
  FiGlobe, 
  FiLoader,
  FiUpload,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiPercent,
  FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings state
  const [formData, setFormData] = useState({
    site_name: 'Fleur Notes',
    site_tagline: 'Handcrafted Stationery & Gifts',
    contact_email: 'hello@fleurnotes.com',
    contact_phone: '+1 (800) 555-0199',
    store_address: '123 Blossom Avenue, Suite 400, New York, NY 10001',
    currency: 'INR (₹)',
    tax_rate: '18',
    flat_shipping_rate: '10.00',
    free_shipping_threshold: '100.00',
    enable_free_shipping: 'true',
    enable_stripe: 'true',
    enable_cod: 'true',
    stripe_public_key: 'pk_test_sample_fleur_notes',
    instagram_url: 'https://instagram.com/fleurnotes',
    facebook_url: 'https://facebook.com/fleurnotes',
    pinterest_url: 'https://pinterest.com/fleurnotes'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch Settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await ApiInstance.get('/settings');
        if (response.data?.success && response.data.data) {
          setFormData((prev) => ({
            ...prev,
            ...response.data.data
          }));
          if (response.data.data.site_logo) {
            setLogoPreview(`${ApiInstance.defaults.baseURL.replace('/api/admin', '')}${response.data.data.site_logo}`);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo image size must be less than 2MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      if (logoFile) {
        payload.append('logo', logoFile);
      }

      const response = await ApiInstance.put('/settings', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        toast.success('System settings updated successfully!');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const settingTabs = [
    { id: 'general', label: 'General Store', icon: FiShoppingBag },
    { id: 'shipping', label: 'Shipping & Delivery', icon: FiTruck },
    { id: 'payment', label: 'Payment & Tax', icon: FiCreditCard },
    { id: 'social', label: 'Social & Branding', icon: FiGlobe }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7A0C1E]/20 text-[#2B1B17]">
              <FiSettings className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Store & System Settings
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Configure store preferences, shipping rules, payment gateways, and site metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="btn-primary py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01] shrink-0"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-[#E8DACD] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {settingTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#FAF5EF] text-[#2B1B17] shadow-sm scale-[1.01]'
                  : 'bg-[#F2E6DA] text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] p-8 relative min-h-[450px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl">
            <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
              <FiLoader className="w-6 h-6 animate-spin" />
              <span>Loading System Settings...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            {/* 1. GENERAL STORE SETTINGS */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8DACD]">
                  <FiShoppingBag className="w-5 h-5 text-[#7A0C1E]" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    General Store Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Store / Site Name
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      value={formData.site_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      name="site_tagline"
                      value={formData.site_tagline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Support Contact Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Support Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Store Physical Address
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                    <textarea
                      rows="3"
                      name="store_address"
                      value={formData.store_address}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] resize-y"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Primary Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] cursor-pointer"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. SHIPPING SETTINGS */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8DACD]">
                  <FiTruck className="w-5 h-5 text-[#7A0C1E]" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Shipping & Delivery Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Flat Rate Shipping Charge (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        name="flat_shipping_rate"
                        value={formData.flat_shipping_rate}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Free Shipping Order Threshold (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        name="free_shipping_threshold"
                        value={formData.free_shipping_threshold}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">Enable Free Shipping Rule</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Automatically waive delivery fee when order total exceeds threshold.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable_free_shipping"
                      checked={formData.enable_free_shipping === 'true'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DACD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A0C1E]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* 3. PAYMENT & TAX SETTINGS */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8DACD]">
                  <FiCreditCard className="w-5 h-5 text-[#7A0C1E]" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Payment Gateway & Tax Rules
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Default Tax / GST Rate (%)
                  </label>
                  <div className="relative max-w-sm">
                    <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      step="0.1"
                      name="tax_rate"
                      value={formData.tax_rate}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">Enable Cash on Delivery (COD)</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Allow customers to pay in cash upon product delivery.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable_cod"
                      checked={formData.enable_cod === 'true'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DACD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A0C1E]"></div>
                  </label>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs">Enable Online Credit/Debit Card Checkout</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Accept online payments securely via Stripe gateway.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable_stripe"
                      checked={formData.enable_stripe === 'true'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DACD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A0C1E]"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Stripe Public Key
                  </label>
                  <input
                    type="text"
                    name="stripe_public_key"
                    value={formData.stripe_public_key}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                  />
                </div>
              </div>
            )}

            {/* 4. SOCIAL & BRANDING */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8DACD]">
                  <FiGlobe className="w-5 h-5 text-[#7A0C1E]" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Social Links & Branding Logo
                  </h3>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Store Brand Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="w-16 h-16 rounded-2xl border border-[#E8DACD] overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                        <img src={logoPreview} alt="Store Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#7A0C1E] text-white font-black text-xl flex items-center justify-center">
                        FN
                      </div>
                    )}
                    <label className="btn-primary py-2.5 px-4 rounded-2xl font-black text-xs cursor-pointer flex items-center gap-2">
                      <FiUpload className="w-4 h-4" />
                      <span>Upload New Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      name="facebook_url"
                      value={formData.facebook_url}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Pinterest Board URL
                    </label>
                    <input
                      type="url"
                      name="pinterest_url"
                      value={formData.pinterest_url}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F2E6DA] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Action */}
            <div className="pt-6 border-t border-[#E8DACD] flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-3.5 px-8 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;