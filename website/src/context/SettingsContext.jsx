'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, getLogoUrl } from '@/services/settingService';

const SettingsContext = createContext({
  settings: {},
  logoUrl: '/images/logo/logo.png',
  siteName: 'Caflore',
  siteTagline: 'Coffee • Flowers • Gifts',
  contactEmail: 'hello@caflore.com',
  contactPhone: '+1 (800) 555-0199',
  storeAddress: '123 Blossom Avenue, Suite 400, New York, NY 10001',
  businessHours: 'Mon – Fri: 9:00 AM – 6:00 PM (EST)',
  instagramUrl: 'https://instagram.com/caflore',
  facebookUrl: 'https://facebook.com/caflore',
  pinterestUrl: 'https://pinterest.com/caflore',
  newsletterTitle: 'Get 10% Off Your First Order!',
  newsletterSubtitle: 'Join our newsletter for exclusive offers, new arrivals, and more.',
  freeShippingThreshold: 1000,
  flatShippingRate: 99,
  enableFreeShipping: true,
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [logoUrl, setLogoUrl] = useState('/images/logo/logo.png');

  const fetchSettings = async () => {
    const data = await getSettings();
    setSettings(data);
    if (data?.site_logo) {
      setLogoUrl(getLogoUrl(data.site_logo));
    } else {
      setLogoUrl('/images/logo/logo.png');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const freeShippingThreshold = settings?.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 1000;
  const flatShippingRate = settings?.flat_shipping_rate ? parseFloat(settings.flat_shipping_rate) : 99;
  const enableFreeShipping = settings?.enable_free_shipping === undefined ? true : (settings?.enable_free_shipping === 'true' || settings?.enable_free_shipping === true);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        logoUrl,
        siteName: settings?.site_name,
        siteTagline: settings?.site_tagline,
        contactEmail: settings?.contact_email,
        contactPhone: settings?.contact_phone,
        storeAddress: settings?.store_address,
        businessHours: settings?.business_hours || 'Mon – Fri: 9:00 AM – 6:00 PM (EST)',
        instagramUrl: settings?.instagram_url,
        facebookUrl: settings?.facebook_url,
        pinterestUrl: settings?.pinterest_url,
        newsletterTitle: settings?.newsletter_title || 'Get 10% Off Your First Order!',
        newsletterSubtitle: settings?.newsletter_subtitle || 'Join our newsletter for exclusive offers, new arrivals, and more.',
        freeShippingThreshold,
        flatShippingRate,
        enableFreeShipping,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
