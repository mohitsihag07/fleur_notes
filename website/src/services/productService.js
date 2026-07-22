import { apiRequest } from './api';

export const productService = {
  featuredProducts: async () => {
    try {
      const response = await apiRequest('/users/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products in service:', error);
      return [];
    }
  },

  newProducts: async () => {
    try {
      const response = await apiRequest('/users/products/new');
      return response.data;
    } catch (error) {
      console.error('Error fetching new products in service:', error);
      return [];
    }
  },

  bestsellerProducts: async () => {
    try {
      const response = await apiRequest('/users/products/bestseller');
      return response.data;
    } catch (error) {
      console.error('Error fetching bestseller products in service:', error);
      return [];
    }
  },
  
  getProducts: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.status) query.append('status', params.status);
      if (params.category_id) query.append('category_id', params.category_id);
      if (params.search) query.append('search', params.search);
      
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const response = await apiRequest(`/users/products${queryString}`);
      return response.data?.data || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products in service:', error);
      return [];
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await apiRequest(`/users/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id} in service:`, error);
      return null;
    }
  }
};
