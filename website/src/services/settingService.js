import { apiRequest, getBackendURL } from './api';

export async function getSettings() {
  try {
    const data = await apiRequest('/settings/public');
    return data?.data || {};
  } catch (error) {
    console.error('Failed to load website settings:', error);
    try {
      const fallback = await apiRequest('/admin/settings/public');
      return fallback?.data || {};
    } catch (e) {
      return {};
    }
  }
}

export function getLogoUrl(siteLogo) {
  if (!siteLogo) return '/images/logo/logo.png';
  if (siteLogo.startsWith('http://') || siteLogo.startsWith('https://')) {
    return siteLogo;
  }
  const backendUrl = getBackendURL();
  return `${backendUrl}${siteLogo.startsWith('/') ? '' : '/'}${siteLogo}`;
}
