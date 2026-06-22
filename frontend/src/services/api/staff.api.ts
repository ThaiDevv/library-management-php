import axiosClient from '../../config/axios';

export interface Staff {
  MaNV: string;
  HoTen: string;
  DienThoai?: string;
  SDT?: string;
  Email?: string;
  DiaChi?: string;
  vaitro?: string;
  password?: string;
}

export const staffApi = {
  getAll: async () => {
    const response = await axiosClient.get('/staffs');
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    
    const mappedData = Array.isArray(data) ? data.map((item: any) => ({
      ...item,
      MaNV: item['Mã Nhân Viên'] || item.MaNV,
      HoTen: item['Họ Tên'] || item.HoTen,
      DienThoai: item['Số Điện Thoại'] || item.DienThoai || item.SDT,
      SDT: item['Số Điện Thoại'] || item.SDT || item.DienThoai,
      vaitro: item['Vai Trò'] || item.vaitro,
    })) : [];
    
    return mappedData;
  },

  getOne: async (id: string) => {
    const response = await axiosClient.get(`/staffs/${id}`);
    const item = response.data;
    if (!item) return item;
    return {
      ...item,
      MaNV: item['Mã Nhân Viên'] || item.MaNV,
      HoTen: item['Họ Tên'] || item.HoTen,
      DienThoai: item['Số Điện Thoại'] || item.DienThoai || item.SDT,
      SDT: item['Số Điện Thoại'] || item.SDT || item.DienThoai,
      vaitro: item['Vai Trò'] || item.vaitro,
    };
  },

  create: async (data: Staff) => {
    const response = await axiosClient.post('/staffs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Staff>) => {
    const response = await axiosClient.patch(`/staffs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/staffs/${id}`);
    return response.data;
  },
};
