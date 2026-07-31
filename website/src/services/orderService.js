import { apiRequest } from './api';

export const orderService = {
  placeOrder: async (orderPayload) => {
    try {
      const response = await apiRequest('/users/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      return response;
    } catch (error) {
      console.error('Error placing order via API:', error);
      return { success: false, message: error.message || 'Failed to place order' };
    }
  },

  getUserOrders: async () => {
    try {
      const response = await apiRequest('/users/orders');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user orders via API:', error);
      return [];
    }
  }
};
