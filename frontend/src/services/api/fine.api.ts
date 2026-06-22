import axiosClient from '../../config/axios';

export interface Fine {
  MaPhieuPhat?: string;
  MaPM?: string;
  MaDocGia?: string;
  TenDocGia?: string;
  SoTienPhat?: number;
  TrangThai?: string;
  NgayPhat?: string;
  NgayThanhToan?: string;
  LyDo?: string;
}

export const fineApi = {
  getAll: async (params?: { MaDocGia?: string; MaPM?: string }) => {
    const response = await axiosClient.get('/fines', { params });
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    if (!Array.isArray(data)) return [];
    
    return data.map((fine: any) => ({
      ...fine,
      SoTienPhat: fine.SoTien,
      NgayPhat: fine.NgayTao
    }));
  },

  pay: async (id: string, MaNV: string) => {
    const response = await axiosClient.patch(`/fines/${id}/pay/${MaNV}`);
    return response.data;
  },
};
