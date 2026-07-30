import { apiRequest, getBackendURL } from './api';

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  const backendUrl = getBackendURL();
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${backendUrl}${path}`;
};

export const cmsService = {
  /**
   * Fetch a CMS page by slug (public, no auth needed)
   * Falls back gracefully if not found.
   */
  getCmsPage: async (slug) => {
    try {
      const res = await apiRequest(`/users/cms/${slug}`);
      if (res?.success && res?.data) {
        const page = res.data;
        return {
          ...page,
          image: resolveImageUrl(page.image),
          values_section_image: resolveImageUrl(page.values_section_image),
        };
      }
      return null;
    } catch (error) {
      console.error(`[cmsService] Failed to fetch CMS page "${slug}":`, error);
      return null;
    }
  }
};
