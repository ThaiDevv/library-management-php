import axiosClient from '../../config/axios';

export interface BorrowTicket {
  MaPM: string;
  MaDocGia?: string;
  TenDocGia?: string;
  NhanVienLap?: string;
  NgayMuon: string;
  NgayTraDuKien: string;
  TrangThaiPhieu?: string;
  DanhSachCuonSach?: string;
  books?: BorrowBook[];
}

export interface BorrowBook {
  MaCuonSach: string;
  TenSach?: string;
  NgayTraThucTe?: string;
  TrangThaiMuonTra?: string;
}

export const borrowApi = {
  getAll: async (params?: { TuNgay?: string; DenNgay?: string; TenDocGia?: string }) => {
    const response = await axiosClient.get('/borrow-tickets', { params });
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    if (!Array.isArray(data)) return [];

    // Group by MaPM because v_phieumuonchitiet returns one row per book
    const grouped = data.reduce((acc: any, item: any) => {
      if (!acc[item.MaPM]) {
        acc[item.MaPM] = {
          MaPM: item.MaPM,
          TenDocGia: item.TenDocGia,
          NhanVienLap: item.NhanVienLap,
          NgayMuon: item.NgayMuon,
          NgayTraDuKien: item.NgayTraDuKien,
          TrangThaiPhieu: item.TrangThaiPhieu || (item.TrangThaiMuonTra === 'Đang mượn' ? 'Đang mượn' : 'Hoàn tất'),
          DanhSachCuonSach: item.DanhSachCuonSach,
          books: []
        };
      }
      acc[item.MaPM].books.push({
        MaCuonSach: item.MaCuonSach,
        TenSach: item.TenSach,
        NgayTraThucTe: item.NgayTraThucTe,
        TrangThaiMuonTra: item.TrangThaiMuonTra
      });
      return acc;
    }, {});

    return Object.values(grouped);
  },

  getOne: async (id: string) => {
    const response = await axiosClient.get(`/borrow-tickets/${id}`);
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return data;
  },

  create: async (data: { MaDocGia: string; MaNV: string; NgayTraDuKien: string; DanhSach: string[] }) => {
    const response = await axiosClient.post('/borrow-tickets', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/borrow-tickets/${id}`);
    return response.data;
  },

  extendDeadline: async (id: string, currentDeadline: string, newDeadline: string) => {
    const start = new Date(currentDeadline);
    const end = new Date(newDeadline);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const SoNgayThem = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const response = await axiosClient.patch(`/borrow-tickets/${id}/deadline`, { 
      MaPM: id,
      SoNgayThem 
    });
    return response.data;
  },

  addBookToTicket: async (id: string, data: { DanhSach: string[] }) => {
    const response = await axiosClient.post(`/borrow-tickets/${id}/books`, data);
    return response.data;
  },

  returnBooks: async (id: string, bookIds: string[]) => {
    const response = await axiosClient.delete(`/borrow-tickets/${id}/books`, { data: { MaPM: id, DanhSach: bookIds } });
    return response.data;
  },

  returnMany: async (id: string) => {
    const response = await axiosClient.post(`/borrow-tickets/${id}/return`);
    return response.data;
  },
};
