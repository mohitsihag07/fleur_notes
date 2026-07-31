import { apiRequest } from './api';

export const wishlistService = {
  getWishlist: async () => {
    try {
      const response = await apiRequest('/users/wishlist');
      return response.data?.items || [];
    } catch (error) {
      console.error('Error fetching wishlist from API:', error);
      return null;
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const response = await apiRequest('/users/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      return response.data || { isAdded: false, items: [] };
    } catch (error) {
      console.error('Error toggling wishlist item via API:', error);
      return null;
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const response = await apiRequest(`/users/wishlist/remove/${productId}`, {
        method: 'DELETE'
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error removing from wishlist via API:', error);
      return null;
    }
  },

  clearWishlist: async () => {
    try {
      const response = await apiRequest('/users/wishlist/clear', {
        method: 'DELETE'
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error clearing wishlist via API:', error);
      return null;
    }
  },

  syncWishlist: async (items) => {
    try {
      const response = await apiRequest('/users/wishlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error syncing wishlist via API:', error);
      return null;
    }
  }
};
