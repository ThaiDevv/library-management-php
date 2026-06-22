import axiosClient from '../../config/axios';

export interface Reader {
  MaDocGia: string;
  HoTen: string;
  NgaySinh?: string;
  DiaChi?: string;
  DienThoai?: string;
  SDT?: string; // For create/update DTO
  TrangThai?: string;
}

export const readerApi = {
  getAll: async (tukhoa?: string) => {
    const response = await axiosClient.get('/readers', { params: tukhoa ? { tukhoa } : {} });
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return Array.isArray(data) ? data : [];
  },

  getOne: async (id: string) => {
    const response = await axiosClient.get(`/readers/${id}`);
    return response.data;
  },

  create: async (data: { MaDocGia: string; HoTen: string; NgaySinh: string; DiaChi: string; SDT: string }) => {
    const response = await axiosClient.post('/readers', data);
    return response.data;
  },

  update: async (id: string, data: { HoTen?: string; NgaySinh?: string; DiaChi?: string; SDT?: string }) => {
    const response = await axiosClient.patch(`/readers/${id}`, data);
    return response.data;
  },

  lock: async (id: string) => {
    const response = await axiosClient.delete(`/readers/${id}`);
    return response.data;
  },

  unlock: async (id: string) => {
    const response = await axiosClient.post(`/readers/${id}/unlock`);
    return response.data;
  },
};
