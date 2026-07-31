import { create } from 'zustand';
import ApiInstance, { getBackendURL } from '../utils/ApiInstance';

const useSettingsStore = create((set, get) => ({
  settings: {},
  isLoading: false,
  isFetched: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await ApiInstance.get('/settings');
      if (response.data?.success) {
        set({ settings: response.data.data || {}, isFetched: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ isLoading: false });
    }
  },

  getSiteName: () => {
    const { settings } = get();
    return settings?.site_name;
  },

  getTagline: () => {
    const { settings } = get();
    return settings?.site_tagline;
  },

  getContactEmail: () => {
    const { settings } = get();
    return settings?.contact_email;
  },

  getContactPhone: () => {
    const { settings } = get();
    return settings?.contact_phone;
  },

  getStoreAddress: () => {
    const { settings } = get();
    return settings?.store_address;
  },

  getInstagramUrl: () => {
    const { settings } = get();
    return settings?.instagram_url;
  },

  getFacebookUrl: () => {
    const { settings } = get();
    return settings?.facebook_url;
  },

  getPinterestUrl: () => {
    const { settings } = get();
    return settings?.pinterest_url;
  },

  getNewsletterTitle: () => {
    const { settings } = get();
    return settings?.newsletter_title;
  },

  getNewsletterSubtitle: () => {
    const { settings } = get();
    return settings?.newsletter_subtitle || 'Join our newsletter for exclusive offers, new arrivals, and more.';
  },

  getLogoUrl: () => {
    const { settings } = get();
    const siteLogo = settings?.site_logo;
    if (!siteLogo) return '/logo.jpg';
    if (siteLogo.startsWith('http://') || siteLogo.startsWith('https://')) {
      return siteLogo;
    }
    const backendUrl = getBackendURL();
    return `${backendUrl}${siteLogo.startsWith('/') ? '' : '/'}${siteLogo}`;
  }
}));

export default useSettingsStore;
