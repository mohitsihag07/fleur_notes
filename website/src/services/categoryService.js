import { apiRequest } from './api';

export const categoryService = {
  getCategories: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.status) query.append('status', params.status);
      
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const response = await apiRequest(`/users/categories${queryString}`);
      
      const list = response.data?.categories || response.data?.data || (Array.isArray(response.data) ? response.data : []);
      return list;
    } catch (error) {
      console.error('Error fetching categories in service:', error);
      return [];
    }
  },
  
  getCategoryById: async (id) => {
    try {
      const response = await apiRequest(`/users/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id} in service:`, error);
      return null;
    }
  }
};
