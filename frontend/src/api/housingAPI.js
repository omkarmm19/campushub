import api from './axiosInstance';

export const housingAPI = {
  getListings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.listing_type) params.append('listing_type', filters.listing_type);
    if (filters.max_rent) params.append('max_rent', filters.max_rent);
    if (filters.max_distance) params.append('max_distance', filters.max_distance);
    if (filters.sharing_type) params.append('sharing_type', filters.sharing_type);

    const response = await api.get(`/housing?${params.toString()}`);
    return response.data;
  },

  getListing: async (id) => {
    const response = await api.get(`/housing/${id}`);
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post('/housing', listingData);
    return response.data;
  },

  uploadImages: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/housing/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateListing: async (id, updateData) => {
    const response = await api.put(`/housing/${id}`, updateData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/housing/${id}`);
    return response.data;
  },
};
