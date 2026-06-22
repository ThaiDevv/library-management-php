import axiosClient from '../../config/axios';

export const authApi = {
  login: async (MaNV: string, password: string) => {
    const response = await axiosClient.post('/auth/login', { MaNV, password });
    return response.data;
  },
  me: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};
