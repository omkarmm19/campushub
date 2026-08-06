import api from './axiosInstance';

export const lostFoundAPI = {
  getPosts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.post_type) params.append('post_type', filters.post_type);
    if (filters.is_resolved !== undefined && filters.is_resolved !== '') params.append('is_resolved', filters.is_resolved);
    const response = await api.get(`/lost-found?${params.toString()}`);
    return response.data;
  },
  getPost: async (id) => (await api.get(`/lost-found/${id}`)).data,
  createPost: async (data) => (await api.post('/lost-found', data)).data,
  uploadImages: async (id, files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return (await api.post(`/lost-found/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  updatePost: async (id, data) => (await api.put(`/lost-found/${id}`, data)).data,
  deletePost: async (id) => (await api.delete(`/lost-found/${id}`)).data,
};

export const opportunitiesAPI = {
  getOpportunities: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.opp_type) params.append('opp_type', filters.opp_type);
    return (await api.get(`/opportunities?${params.toString()}`)).data;
  },
  getOpportunity: async (id) => (await api.get(`/opportunities/${id}`)).data,
  createOpportunity: async (data) => (await api.post('/opportunities', data)).data,
  updateOpportunity: async (id, data) => (await api.put(`/opportunities/${id}`, data)).data,
  deleteOpportunity: async (id) => (await api.delete(`/opportunities/${id}`)).data,
};

export const eventsAPI = {
  getEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.event_type) params.append('event_type', filters.event_type);
    return (await api.get(`/events?${params.toString()}`)).data;
  },
  getEvent: async (id) => (await api.get(`/events/${id}`)).data,
  createEvent: async (data) => (await api.post('/events', data)).data,
  updateEvent: async (id, data) => (await api.put(`/events/${id}`, data)).data,
  deleteEvent: async (id) => (await api.delete(`/events/${id}`)).data,
};
