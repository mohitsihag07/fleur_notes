import { apiRequest } from './api';

export const addressService = {
  getAddresses: async () => {
    try {
      const response = await apiRequest('/users/addresses');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching addresses from API:', error);
      return null;
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await apiRequest('/users/addresses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });
      return response.data || null;
    } catch (error) {
      console.error('Error adding address via API:', error);
      return null;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await apiRequest(`/users/addresses/delete/${addressId}`, {
        method: 'DELETE'
      });
      return response.data || [];
    } catch (error) {
      console.error('Error deleting address via API:', error);
      return null;
    }
  }
};
