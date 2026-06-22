import axiosClient from '../../config/axios';

export interface Book {
  MaDauSach: string;
  TenSach: string;
  MaTheLoai: string;
  TenTheLoai?: string;
  TacGia: string;
  NamXuatBan?: number;
  NamXB?: number; // Used for create/update DTO
  TongSoCuon?: number;
  SoCuonSanSang?: number;
  Quantity?: number;
}

export interface BookInstance {
  MaCuonSach: string;
  MaDauSach: string;
  TrangThai: string;
  TinhTrang: string;
}

export const bookApi = {
  getAll: async (params?: { TenSach?: string; MaTheLoai?: string; TacGia?: string }) => {
    const response = await axiosClient.get('/books', { params });
    let rawData = response.data;
    if (Array.isArray(rawData) && Array.isArray(rawData[0])) {
      rawData = rawData[0];
    }
    return rawData.map((book: any) => ({
      ...book,
      Quantity: book.SoCuonSanSang ?? 0,
    }));
  },

  getOne: async (id: string) => {
    const response = await axiosClient.get(`/books/${id}`);
    const book = response.data;
    return {
      ...book,
      Quantity: book.SoCuonSanSang ?? 0,
    };
  },

  create: async (data: { MaDauSach: string; TenSach: string; MaTheLoai: string; TacGia: string; NamXB: number }) => {
    const response = await axiosClient.post('/books', data);
    return response.data;
  },

  update: async (id: string, data: { TenSach?: string; MaTheLoai?: string; TacGia?: string; NamXB?: number }) => {
    const response = await axiosClient.patch(`/books/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/books/${id}`);
    return response.data;
  },

  getInstances: async (id: string) => {
    const response = await axiosClient.get(`/books/${id}/instances`);
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      data = data[0];
    }
    return data;
  },

  addInstance: async (id: string, SoLuong: number) => {
    const response = await axiosClient.post(`/books/${id}/instances`, { SoLuong });
    return response.data;
  },
};
