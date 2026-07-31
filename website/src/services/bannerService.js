import { apiRequest } from './api';

export const bannerService = {
  getBanners: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.type) query.append('type', params.type);
      
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const response = await apiRequest(`/users/banners${queryString}`, {
        method: 'GET',
        cache: 'no-store'
      });
      
      return response.data?.banners || [];
    } catch (error) {
      console.error('Error fetching banners in service:', error);
      return [];
    }
  },
  
  getBannerById: async (id) => {
    try {
      const response = await apiRequest(`/users/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching banner ${id} in service:`, error);
      return null;
    }
  }
};
