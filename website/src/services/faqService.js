import { apiRequest } from './api';

export const faqService = {
  getFAQs: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') {
        query.append('category', params.category);
      }
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const response = await apiRequest(`/users/faqs${queryString}`);
      const list = response.data?.data || response.data || (Array.isArray(response.data) ? response.data : []);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }
};
