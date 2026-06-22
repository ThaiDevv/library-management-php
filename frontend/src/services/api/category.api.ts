import axiosClient from '../../config/axios';

export interface Category {
  MaTheLoai: string;
  TenTheLoai: string;
  MoTa?: string;
}

export const categoryApi = {
  getAll: async () => {
    const response = await axiosClient.get('/categories');
    return response.data;
  },
  create: async (data: Category) => {
    const response = await axiosClient.post('/categories', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Category>) => {
    const response = await axiosClient.patch(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  },
};
