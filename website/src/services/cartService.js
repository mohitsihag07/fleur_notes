import { apiRequest } from './api';

export const cartService = {
  getCart: async () => {
    try {
      const response = await apiRequest('/users/cart');
      return response.data?.items || [];
    } catch (error) {
      console.error('Error fetching cart from API:', error);
      return null;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await apiRequest('/users/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error adding to cart via API:', error);
      return null;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const response = await apiRequest('/users/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error updating cart item via API:', error);
      return null;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const response = await apiRequest(`/users/cart/remove/${productId}`, {
        method: 'DELETE'
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error removing from cart via API:', error);
      return null;
    }
  },

  clearCart: async () => {
    try {
      const response = await apiRequest('/users/cart/clear', {
        method: 'DELETE'
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error clearing cart via API:', error);
      return null;
    }
  },

  syncCart: async (items) => {
    try {
      const response = await apiRequest('/users/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error syncing cart via API:', error);
      return null;
    }
  }
};
