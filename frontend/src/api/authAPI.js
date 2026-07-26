import api from './axiosInstance';

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { college_email: email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { college_email: email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      college_email: email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },
};
