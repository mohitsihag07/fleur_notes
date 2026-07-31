import { apiRequest } from './api';

export const couponService = {
  getCoupons: async () => {
    try {
      const response = await apiRequest('/users/coupons');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      return [];
    }
  }
};
