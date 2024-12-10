import api from '@/lib/api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/me');
  return response;
};

export const logout = async () => {
  return api.post('/auth/logout');
};
