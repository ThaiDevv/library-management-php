import { useState, useEffect } from 'react';
import { bookApi } from '../services/api/book.api';
import { reportApi } from '../services/api/report.api';
import { categoryApi } from '../services/api/category.api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BookOpen, Users, Library, AlertCircle, TrendingUp, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    activeBorrows: 0,
    overdue: 0,
  });

  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [overdueTickets, setOverdueTickets] = useState<any[]>([]);
  const [currentlyBorrowed, setCurrentlyBorrowed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [books, categories, overdue, borrowed] = await Promise.all([
          bookApi.getAll(),
          categoryApi.getAll(),
          reportApi.overdueTickets(),
          reportApi.currentlyBorrowed(),
        ]);

        setStats({
          totalBooks: books.length,
          totalCategories: categories.length,
          activeBorrows: borrowed.length,
          overdue: overdue.length,
        });

        // Build category chart data
        const catMap = new Map<string, number>();
        books.forEach((b: any) => {
          const cat = categories.find((c: any) => c.MaTheLoai === b.MaTheLoai);
          const catName = cat ? cat.TenTheLoai : (b.MaTheLoai || 'Khác');
          catMap.set(catName, (catMap.get(catName) || 0) + 1);
        });
        setCategoryData(Array.from(catMap, ([name, value]) => ({ name, value })));
        setOverdueTickets(overdue.slice(0, 5));
        setCurrentlyBorrowed(borrowed.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, bg }: any) => (
    <div className={`rounded-xl shadow-notion-card border border-notion-border p-6 flex items-center hover:shadow-notion-deep transition-all duration-200 ${bg || 'bg-notion-bg'}`}>
      <div className={`p-4 rounded-lg ${colorClass} mr-4 flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-notion-textSecondary">{title}</p>
        <h3 className="text-2xl font-bold text-notion-text tracking-notion-title">{isLoading ? <span className="animate-pulse text-notion-textMuted">---</span> : value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Tổng quan Hệ thống</h1>
        <p className="text-base text-notion-textSecondary mt-2 font-medium">Theo dõi hoạt động thư viện theo thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Tổng Đầu sách" value={stats.totalBooks} icon={BookOpen} colorClass="bg-blue-500" />
        <StatCard title="Thể loại" value={stats.totalCategories} icon={Users} colorClass="bg-green-500" />
        <StatCard title="Đang mượn" value={stats.activeBorrows} icon={Library} colorClass="bg-purple-500" />
        <StatCard title="Phiếu quá hạn" value={stats.overdue} icon={AlertCircle} colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-notion-bg p-6 rounded-xl shadow-notion-card border border-notion-border lg:col-span-2">
          <h3 className="text-[22px] font-bold text-notion-text mb-4 flex items-center gap-2 tracking-notion-title leading-tight">
            <TrendingUp className="w-5 h-5 text-notion-blue" />
            Sách theo Thể loại
          </h3>
          <div className="h-72">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Đang tải...</div>
            ) : categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số đầu sách" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Overdue List */}
        <div className="bg-notion-bg p-6 rounded-xl shadow-notion-card border border-notion-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[22px] font-bold text-notion-text flex items-center gap-2 tracking-notion-title leading-tight">
              <AlertCircle className="w-5 h-5 text-[#dd5b00]" />
              Quá hạn
            </h3>
            <span className="bg-[#fff0e6] text-[#dd5b00] px-3 py-1 rounded-full text-xs font-semibold tracking-notion-badge uppercase">
              {stats.overdue}
            </span>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-notion-textMuted text-sm">Đang tải...</div>
            ) : overdueTickets.length === 0 ? (
              <div className="text-center py-8 bg-notion-warmBg rounded-lg border border-notion-border">
                <p className="text-sm text-notion-textSecondary">🎉 Không có phiếu quá hạn!</p>
              </div>
            ) : (
              overdueTickets.map((ticket: any, i) => {
                const maPhieu = ticket.MaPM || ticket.MaPhieu || ticket.MaPhieuMuon || Object.values(ticket)[0];
                const maDocGia = ticket.MaDocGia || ticket.TenDocGia || Object.values(ticket)[1];
                const hanTra = ticket.HanTra || ticket.NgayTraDuKien || ticket.NgayTra || Object.values(ticket)[2];
                return (
                  <div key={i} className="flex items-start p-3 bg-[#fff0e6] rounded-xl border border-[#dd5b00]/20">
                    <div className="bg-white p-2 rounded-lg border border-notion-border mr-3 flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-[#dd5b00]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-notion-text truncate">Phiếu #{String(maPhieu)}</p>
                      <p className="text-xs text-notion-textSecondary mt-0.5 truncate font-medium">Độc giả: {String(maDocGia)}</p>
                      {hanTra && (
                        <p className="text-xs font-bold text-[#dd5b00] mt-1 tracking-notion-badge uppercase">
                          Hạn: {new Date(hanTra).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Currently Borrowed Quick View */}
      {!isLoading && currentlyBorrowed.length > 0 && (
        <div className="bg-notion-bg p-6 rounded-xl shadow-notion-card border border-notion-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[22px] font-bold text-notion-text flex items-center gap-2 tracking-notion-title leading-tight">
              <CreditCard className="w-5 h-5 text-[#391c57]" />
              Sách đang được mượn (Top 5)
            </h3>
            <span className="bg-notion-badgeBg text-notion-badgeText px-3 py-1 rounded-full text-xs font-semibold tracking-notion-badge uppercase">
              {stats.activeBorrows} cuốn
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border bg-notion-warmBg">
                  {Object.keys(currentlyBorrowed[0]).slice(0, 5).map(key => (
                    <th key={key} className="text-left py-3 px-4 text-xs font-semibold text-notion-textSecondary tracking-notion-badge uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentlyBorrowed.map((row, i) => (
                  <tr key={i} className="border-b border-notion-border hover:bg-notion-warmBg transition-colors">
                    {Object.values(row).slice(0, 5).map((val: any, j) => (
                      <td key={j} className="py-3 px-4 text-notion-text text-sm font-medium">
                        {typeof val === 'string' && (val.includes('T') || val.match(/\d{4}-\d{2}-\d{2}/)) ? new Date(val).toLocaleDateString('vi-VN') : String(val ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
