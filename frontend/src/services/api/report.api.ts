import axiosClient from '../../config/axios';

export const reportApi = {
  booksByCategory: async () => {
    const response = await axiosClient.get('/reports/books-by-category');
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return Array.isArray(data) ? data : [];
  },

  currentlyBorrowed: async (params?: { MaDocGia?: string; MaDauSach?: string }) => {
    const response = await axiosClient.get('/reports/currently-borrowed', { params });
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return Array.isArray(data) ? data : [];
  },

  borrowStats: async (params?: { TuNgay?: string; DenNgay?: string }) => {
    const response = await axiosClient.get('/reports/borrow-stats', { params });
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return Array.isArray(data) ? data : [];
  },

  overdueTickets: async () => {
    const response = await axiosClient.get('/reports/overdue-tickets');
    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
    return Array.isArray(data) ? data : [];
  },

  exportPhantomDemo: async () => {
    const response = await axiosClient.get('/reports/export-phantom-demo');
    // Ensure nested arrays from procedures are flattened
    let uiData = response.data.uiData;
    let jsonData = response.data.jsonData;
    
    if (Array.isArray(uiData) && Array.isArray(uiData[0])) uiData = uiData[0];
    if (Array.isArray(jsonData) && Array.isArray(jsonData[0])) jsonData = jsonData[0];
    
    return { uiData: Array.isArray(uiData) ? uiData : [], jsonData: Array.isArray(jsonData) ? jsonData : [] };
  },
};
