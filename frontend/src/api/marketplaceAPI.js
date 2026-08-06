import api from './axiosInstance';

export const marketplaceAPI = {
  getItems: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.listing_type) params.append('listing_type', filters.listing_type);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.condition) params.append('condition', filters.condition);

    const response = await api.get(`/marketplace?${params.toString()}`);
    return response.data;
  },

  getItem: async (id) => {
    const response = await api.get(`/marketplace/${id}`);
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await api.post('/marketplace', itemData);
    return response.data;
  },

  uploadImages: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post(`/marketplace/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateItem: async (id, updateData) => {
    const response = await api.put(`/marketplace/${id}`, updateData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/marketplace/${id}`);
    return response.data;
  },
};
