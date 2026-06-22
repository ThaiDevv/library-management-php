import { useState, useEffect } from 'react';
import { fineApi, type Fine } from '../../services/api/fine.api';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Search, CreditCard, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

const FineList = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMaDocGia, setSearchMaDocGia] = useState('');
  const [searchMaPM, setSearchMaPM] = useState('');
  const { user } = useAuthStore();

  const fetchFines = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchMaDocGia) params.MaDocGia = searchMaDocGia;
      if (searchMaPM) params.MaPM = searchMaPM;
      const data = await fineApi.getAll(params);
      setFines(data);
    } catch (error) {
      toast.error('Lấy danh sách phiếu phạt thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePay = async (fine: Fine) => {
    const id = fine.MaPhieuPhat || fine.MaPM;
    if (!id) return;
    if (!window.confirm(`Xác nhận thanh toán phiếu phạt ${id}?`)) return;
    try {
      await fineApi.pay(id, user?.sub || '');
      toast.success('Thanh toán thành công');
      fetchFines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  };

  const totalUnpaid = fines.filter(f => f.TrangThai !== 'Đã thanh toán').reduce((acc, f) => acc + (f.SoTienPhat || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Quản lý Phiếu Phạt</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Xem và thanh toán các phiếu phạt quá hạn.</p>
        </div>
        {totalUnpaid > 0 && (
          <div className="flex items-center gap-2 bg-[#fff0e6] border border-[#dd5b00]/20 rounded-xl px-4 py-2">
            <AlertCircle className="w-5 h-5 text-[#dd5b00]" />
            <span className="text-sm font-bold text-[#dd5b00] tracking-notion-badge uppercase">
              Tổng chưa thanh toán: {totalUnpaid.toLocaleString('vi-VN')} đ
            </span>
          </div>
        )}
      </div>

      <div className="bg-notion-bg p-5 rounded-2xl shadow-notion-card border border-notion-border flex flex-col sm:flex-row gap-3">
        <div className="flex items-center flex-1 border border-[#dddddd] rounded px-3 focus-within:ring-1 focus-within:ring-notion-focus focus-within:border-notion-focus transition-colors">
          <Search className="text-notion-textMuted w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Mã độc giả..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-notion-text"
            value={searchMaDocGia}
            onChange={(e) => setSearchMaDocGia(e.target.value)}
          />
        </div>
        <div className="flex items-center flex-1 border border-[#dddddd] rounded px-3 focus-within:ring-1 focus-within:ring-notion-focus focus-within:border-notion-focus transition-colors">
          <Search className="text-notion-textMuted w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Mã phiếu mượn..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-notion-text"
            value={searchMaPM}
            onChange={(e) => setSearchMaPM(e.target.value)}
          />
        </div>
        <Button onClick={fetchFines} variant="secondary">Tìm kiếm</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã phiếu phạt</TableHead>
            <TableHead>Mã phiếu mượn</TableHead>
            <TableHead>Mã độc giả</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Số tiền phạt</TableHead>
            <TableHead>Ngày phát</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell></TableRow>
          ) : fines.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-notion-textSecondary font-medium">Không có phiếu phạt nào.</TableCell></TableRow>
          ) : (
            fines.map((fine, idx) => {
              const isPaid = fine.TrangThai === 'Đã thanh toán';
              return (
                <TableRow key={fine.MaPhieuPhat || idx}>
                  <TableCell className="font-semibold text-notion-text">{fine.MaPhieuPhat || '—'}</TableCell>
                  <TableCell>{fine.MaPM || '—'}</TableCell>
                  <TableCell>{fine.MaDocGia || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate text-notion-textSecondary">{fine.LyDo || 'Quá hạn trả sách'}</TableCell>
                  <TableCell className="font-bold text-[#dd5b00]">
                    {(fine.SoTienPhat || 0).toLocaleString('vi-VN')} đ
                  </TableCell>
                  <TableCell>{fine.NgayPhat ? new Date(fine.NgayPhat).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-notion-badge uppercase ${isPaid ? 'bg-[#e8f7ec] text-[#1aae39]' : 'bg-[#fff0e6] text-[#dd5b00]'}`}>
                      {fine.TrangThai || 'Chưa thanh toán'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isPaid && (
                      <Button size="sm" onClick={() => handlePay(fine)} className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        Thanh toán
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FineList;
