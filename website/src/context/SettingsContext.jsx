'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, getLogoUrl } from '@/services/settingService';

const SettingsContext = createContext({
  settings: {},
  logoUrl: '/images/logo/logo.png',
  siteName: '',
  siteTagline: '',
  contactEmail: '',
  contactPhone: '',
  storeAddress: '',
  businessHours: '',
  instagramUrl: '',
  facebookUrl: '',
  pinterestUrl: '',
  newsletterTitle: '',
  newsletterSubtitle: '',
  freeShippingThreshold: 1000,
  flatShippingRate: 99,
  enableFreeShipping: true,
  taxRate: 18,
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [logoUrl, setLogoUrl] = useState('/images/logo/logo.png');

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data || {});
      if (data?.site_logo) {
        setLogoUrl(getLogoUrl(data.site_logo));
      } else {
        setLogoUrl('/images/logo/logo.png');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const freeShippingThreshold = settings?.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 1000;
  const flatShippingRate = settings?.flat_shipping_rate ? parseFloat(settings.flat_shipping_rate) : 99;
  const enableFreeShipping = settings?.enable_free_shipping === undefined ? true : (settings?.enable_free_shipping === 'true' || settings?.enable_free_shipping === true);
  const taxRate = settings?.tax_rate !== undefined && settings?.tax_rate !== '' ? parseFloat(settings.tax_rate) : 18;

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
        businessHours: settings?.business_hours,
        instagramUrl: settings?.instagram_url,
        facebookUrl: settings?.facebook_url,
        pinterestUrl: settings?.pinterest_url,
        newsletterTitle: settings?.newsletter_title,
        newsletterSubtitle: settings?.newsletter_subtitle,
        freeShippingThreshold,
        flatShippingRate,
        enableFreeShipping,
        taxRate,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
