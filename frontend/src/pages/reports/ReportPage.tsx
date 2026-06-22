import { useState, useEffect } from 'react';
import { reportApi } from '../../services/api/report.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { BookOpen, AlertTriangle, TrendingUp, Clock, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

const ReportPage = () => {
  const [booksByCategory, setBooksByCategory] = useState<any[]>([]);
  const [currentlyBorrowed, setCurrentlyBorrowed] = useState<any[]>([]);
  const [borrowStats, setBorrowStats] = useState<any[]>([]);
  const [overdueTickets, setOverdueTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tuNgay, setTuNgay] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [denNgay, setDenNgay] = useState(format(new Date(), 'yyyy-MM-dd'));

  const formatDisplayDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '—';
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '—';
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    // Fetch reports independently to be more resilient
    try {
      const cat = await reportApi.booksByCategory();
      setBooksByCategory(cat);
    } catch (e) { console.error('Books by category failed', e); }

    try {
      const borrowed = await reportApi.currentlyBorrowed();
      setCurrentlyBorrowed(borrowed);
    } catch (e) { console.error('Currently borrowed failed', e); }

    try {
      const overdue = await reportApi.overdueTickets();
      setOverdueTickets(overdue);
    } catch (e) { console.error('Overdue tickets failed', e); }

    setIsLoading(false);
  };

  const fetchBorrowStats = async () => {
    try {
      const stats = await reportApi.borrowStats(tuNgay || denNgay ? { TuNgay: tuNgay || undefined, DenNgay: denNgay || undefined } : undefined);
      setBorrowStats(stats);
    } catch (error) {
      toast.error('Tải thống kê mượn trả thất bại');
    }
  };

  const columnMap: Record<string, string> = {
    'MaPM': 'Mã Phiếu',
    'MaDocGia': 'Mã Độc Giả',
    'TenDocGia': 'Tên Độc Giả',
    'TenSach': 'Tên Sách',
    'MaCuonSach': 'Mã Cuốn Sách',
    'NgayMuon': 'Ngày Mượn',
    'NgayTraDuKien': 'Hạn Trả',
    'NgayTraThucTe': 'Ngày Trả Thực tế',
    'TrangThaiPhieu': 'Trạng Thái',
    'SoNgayTre': 'Ngày Trễ',
    'TienPhat': 'Tiền Phạt',
    'NhanVienLap': 'Người Lập',
    'MaDauSach': 'Mã Đầu Sách',
    'HoTen': 'Họ Tên',
    'DienThoai': 'Điện Thoại',
    'NgayTra': 'Ngày Trả',
    'SoLuongDangMuon': 'Số Lượng Đang Mượn'
  };

  const renderCellContent = (key: string, val: any) => {
    if (val === null || val === undefined) return '—';

    // Check if key implies a date
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('ngay') || lowerKey.includes('date') || lowerKey.includes('han')) {
      if (typeof val === 'string' && (val.includes('-') || val.includes('T'))) {
        return formatDisplayDate(val);
      }
    }

    // Format numbers for currency if it's a fine
    if (lowerKey.includes('tien') || lowerKey.includes('phat')) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
    }

    return String(val);
  };

  const exportCurrentlyBorrowedToJson = async () => {
    const toastId = toast.loading('Đang tải dữ liệu...');
    try {
      const res = await reportApi.exportPhantomDemo();

      // Cập nhật lại giao diện ngay lúc này bằng dữ liệu đọc lần 1
      if (res.uiData) {
        setCurrentlyBorrowed(res.uiData);
      }

      if (!res.jsonData || res.jsonData.length === 0) {
        toast.error('Không có dữ liệu để xuất', { id: toastId });
        return;
      }

      // Dùng dữ liệu đọc lần 2 (có thể có bóng ma) để tạo file JSON
      const dataStr = JSON.stringify(res.jsonData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sach-dang-muon-phantom-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Đã xuất JSON! Hãy đối chiếu số lượng trên màn hình và trong file', { id: toastId, duration: 8000 });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Lỗi khi tải dữ liệu từ CSDL', { id: toastId });
    }
  };

  useEffect(() => {
    fetchAll();
    fetchBorrowStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <div className="bg-notion-bg rounded-2xl shadow-notion-card border border-notion-border p-6 flex items-center hover:shadow-notion-deep transition-all">
      <div className={`p-4 rounded-xl ${colorClass} mr-5 flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-notion-textSecondary">{title}</p>
        <h3 className="text-[32px] font-bold text-notion-text tracking-notion-h2 leading-none mt-1 mb-1">{isLoading ? '...' : value}</h3>
        {subtitle && <p className="text-[12px] text-notion-textMuted font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Báo cáo & Thống kê</h1>
        <p className="text-base text-notion-textSecondary mt-2 font-medium">Tổng quan tình trạng thư viện theo thời gian thực.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Thể loại sách" value={booksByCategory.length} icon={BookOpen} colorClass="bg-blue-500" subtitle="số thể loại" />
        <StatCard title="Đang mượn" value={currentlyBorrowed.length} icon={TrendingUp} colorClass="bg-purple-500" subtitle="cuốn sách" />
        <StatCard title="Phiếu quá hạn" value={overdueTickets.length} icon={AlertTriangle} colorClass="bg-red-500" subtitle="cần xử lý" />
        <StatCard
          title="Thống kê kỳ này"
          value={borrowStats.reduce((acc, curr) => acc + (Object.values(curr).slice(1).reduce((a: any, b: any) => a + (Number(b) || 0), 0)), 0)}
          icon={Clock}
          colorClass="bg-amber-500"
          subtitle="tổng lượt giao dịch"
        />
      </div>

      {/* Books by Category Chart */}
      <div className="bg-notion-bg p-6 rounded-2xl shadow-notion-card border border-notion-border">
        <h3 className="text-[22px] font-bold text-notion-text tracking-notion-title mb-6">Sách theo Thể loại</h3>
        <div className="h-72">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-notion-textMuted font-medium">Đang tải...</div>
          ) : booksByCategory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-notion-textMuted font-medium">Không có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={booksByCategory} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey={booksByCategory[0]?.TenTheLoai ? 'TenTheLoai' : (Object.keys(booksByCategory[0] || {}).find(k => k.toLowerCase().includes('ten')) || Object.keys(booksByCategory[0] || {})[0])}
                  axisLine={false} tickLine={false} tick={{ fontSize: 12 }} angle={-35} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar
                  dataKey={booksByCategory[0]?.TongSoSach !== undefined ? 'TongSoSach' : (Object.keys(booksByCategory[0] || {}).find(k => k.toLowerCase().includes('so') || k.toLowerCase().includes('tong')) || Object.keys(booksByCategory[0] || {})[1])}
                  fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số sách"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Borrow Stats with date filter */}
      <div className="bg-notion-bg p-6 rounded-2xl shadow-notion-card border border-notion-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-[22px] font-bold text-notion-text tracking-notion-title">Thống kê Mượn Trả theo Thời gian</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-notion-textSecondary whitespace-nowrap">Từ:</span>
              <input type="date" className="px-3 py-1.5 border border-[#dddddd] rounded text-sm text-notion-text outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus" value={tuNgay} onChange={e => setTuNgay(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-notion-textSecondary whitespace-nowrap">Đến:</span>
              <input type="date" className="px-3 py-1.5 border border-[#dddddd] rounded text-sm text-notion-text outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus" value={denNgay} onChange={e => setDenNgay(e.target.value)} />
            </div>
            <Button size="sm" onClick={fetchBorrowStats}>Lọc</Button>
          </div>
        </div>
        <div className="h-72">
          {borrowStats.length === 0 ? (
            <div className="h-full flex items-center justify-center text-notion-textMuted flex-col gap-2">
              <TrendingUp className="w-10 h-10 text-notion-textMuted opacity-50" />
              <p className="text-sm font-medium">Chọn khoảng thời gian để xem thống kê</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={borrowStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey={Object.keys(borrowStats[0] || {})[0]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                {Object.keys(borrowStats[0] || {}).slice(1).map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Overdue Tickets */}
      <div className="bg-notion-bg p-6 rounded-2xl shadow-notion-card border border-notion-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[22px] font-bold text-notion-text tracking-notion-title">Phiếu Quá Hạn</h3>
          <span className="bg-[#fff0e6] text-[#dd5b00] text-xs font-semibold px-3 py-1 rounded-full tracking-notion-badge">
            {overdueTickets.length} phiếu
          </span>
        </div>
        {isLoading ? (
          <p className="text-sm text-notion-textMuted font-medium">Đang tải...</p>
        ) : overdueTickets.length === 0 ? (
          <div className="text-center py-8 bg-notion-warmBg rounded-xl border border-notion-border">
            <p className="text-sm text-notion-textSecondary font-medium">🎉 Không có phiếu quá hạn!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border bg-notion-warmBg">
                  {Object.keys(overdueTickets[0]).map(key => (
                    <th key={key} className="text-left py-3 px-3 text-xs font-bold text-notion-textSecondary uppercase tracking-notion-badge">{columnMap[key] || key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueTickets.slice(0, 10).map((ticket, i) => (
                  <tr key={i} className="border-b border-notion-border hover:bg-notion-warmBg transition-colors">
                    {Object.entries(ticket).map(([key, val], j) => (
                      <td key={j} className="py-3 px-3 text-notion-text font-medium">
                        {renderCellContent(key, val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {overdueTickets.length > 10 && (
              <p className="text-xs text-notion-textMuted mt-3 text-center font-medium">Hiển thị 10/{overdueTickets.length} bản ghi</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-notion-bg p-6 rounded-2xl shadow-notion-card border border-notion-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-[22px] font-bold text-notion-text tracking-notion-title">Sách đang được Mượn</h3>
            <span className="bg-notion-badgeBg text-notion-badgeText text-xs font-semibold px-3 py-1 rounded-full tracking-notion-badge">
              {currentlyBorrowed.length} cuốn
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={exportCurrentlyBorrowedToJson}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Xuất JSON</span>
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-notion-textMuted font-medium">Đang tải...</p>
        ) : currentlyBorrowed.length === 0 ? (
          <div className="text-center py-8 bg-notion-warmBg rounded-xl border border-notion-border">
            <p className="text-sm text-notion-textSecondary font-medium">Hiện không có sách nào đang được mượn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border bg-notion-warmBg">
                  {Object.keys(currentlyBorrowed[0]).map(key => (
                    <th key={key} className="text-left py-3 px-3 text-xs font-bold text-notion-textSecondary uppercase tracking-notion-badge">{columnMap[key] || key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentlyBorrowed.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-notion-border hover:bg-notion-warmBg transition-colors">
                    {Object.entries(row).map(([key, val], j) => (
                      <td key={j} className="py-3 px-3 text-notion-text font-medium">
                        {renderCellContent(key, val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {currentlyBorrowed.length > 10 && (
              <p className="text-xs text-notion-textMuted mt-3 text-center font-medium">Hiển thị 10/{currentlyBorrowed.length} bản ghi</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
