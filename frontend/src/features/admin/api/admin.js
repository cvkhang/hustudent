import api from '@/lib/api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUsers = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const toggleBanUser = async (userId, ban, reason = '') => {
  const response = await api.put(`/admin/users/${userId}/ban`, { ban, reason });
  return response.data;
};
