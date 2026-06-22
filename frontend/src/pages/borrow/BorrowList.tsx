import { useState, useEffect } from 'react';
import { borrowApi, type BorrowTicket } from '../../services/api/borrow.api';
import { bookApi, type Book } from '../../services/api/book.api';
import { readerApi, type Reader } from '../../services/api/reader.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Eye, CheckCircle, Search, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

const BorrowList = () => {
  const [tickets, setTickets] = useState<BorrowTicket[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<BorrowTicket | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [maDocGia, setMaDocGia] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [createTicketDeadline, setCreateTicketDeadline] = useState(format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [selectedInstances, setSelectedInstances] = useState<{ MaCuonSach: string; TenSach: string }[]>([]);
  const [availableInstances, setAvailableInstances] = useState<{ bookId: string; instances: any[] } | null>(null);
  const [selectedReturnBooks, setSelectedReturnBooks] = useState<string[]>([]);

  const { user } = useAuthStore();
  
  const formatDisplayDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      // Split to get only the YYYY-MM-DD part to avoid timezone shifts
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '—';
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '—';
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (tuNgay) params.TuNgay = tuNgay;
      if (denNgay) params.DenNgay = denNgay;
      if (searchTerm) params.TenDocGia = searchTerm;

      const [ticketsData, booksData, readersData] = await Promise.all([
        borrowApi.getAll(params),
        bookApi.getAll(),
        readerApi.getAll(),
      ]);

      const sorted = [...(ticketsData as BorrowTicket[])].sort((a: any, b: any) =>
        new Date(b.NgayMuon || 0).getTime() - new Date(a.NgayMuon || 0).getTime()
      );
      setTickets(sorted);
      setBooks(booksData);
      setReaders(readersData);
    } catch (error) {
      toast.error('Lấy dữ liệu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewDetail = async (ticket: BorrowTicket) => {
    setSelectedReturnBooks([]); // Clear selection from previous ticket
    setSelectedTicket(ticket);
    try {
      const detail = await borrowApi.getOne(ticket.MaPM);
      setTicketDetail(detail);
    } catch {
      setTicketDetail(null);
    }
    setIsDetailModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maDocGia) return toast.error('Vui lòng chọn người mượn');
    if (selectedInstances.length === 0) return toast.error('Vui lòng thêm ít nhất một cuốn sách');
    try {
      await borrowApi.create({
        MaDocGia: maDocGia,
        MaNV: user?.sub || '',
        NgayTraDuKien: createTicketDeadline,
        DanhSach: selectedInstances.map(i => i.MaCuonSach),
      });
      toast.success('Tạo phiếu mượn thành công');
      setIsCreateModalOpen(false);
      setSelectedInstances([]);
      setMaDocGia('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tạo phiếu mượn thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Hủy phiếu mượn ${id}?`)) return;
    try {
      await borrowApi.delete(id);
      toast.success('Hủy phiếu mượn thành công');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hủy thất bại');
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newDeadline) return;
    try {
      await borrowApi.extendDeadline(selectedTicket.MaPM, selectedTicket.NgayTraDuKien, newDeadline);
      toast.success('Gia hạn thành công');
      setIsExtendModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gia hạn thất bại');
    }
  };

  const handleReturnAll = async (ticket: BorrowTicket) => {
    if (!window.confirm('Trả tất cả sách trong phiếu này?')) return;
    try {
      await borrowApi.returnMany(ticket.MaPM);
      toast.success('Trả sách thành công');
      fetchData();
      setIsDetailModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Trả sách thất bại');
    }
  };

  const handleReturnOne = async (ticketId: string, bookIds: string[]) => {
    if (bookIds.length === 0) return;
    const msg = bookIds.length === 1 ? `Xác nhận trả cuốn sách mã ${bookIds[0]}?` : `Xác nhận trả ${bookIds.length} cuốn sách đã chọn?`;
    if (!window.confirm(msg)) return;
    try {
      await borrowApi.returnBooks(ticketId, bookIds);
      toast.success('Đã trả sách thành công');
      
      setSelectedReturnBooks([]); // Clear selection
      
      // Refresh detail
      const detail = await borrowApi.getOne(ticketId);
      setTicketDetail(detail);
      
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Trả sách thất bại');
    }
  };

  const toggleReturnSelection = (bookId: string) => {
    if (selectedReturnBooks.includes(bookId)) {
      setSelectedReturnBooks(selectedReturnBooks.filter(id => id !== bookId));
    } else {
      setSelectedReturnBooks([...selectedReturnBooks, bookId]);
    }
  };

  const handleBookClick = async (book: Book) => {
    if ((book.Quantity || 0) <= 0) return toast.error('Sách này hiện đã hết');
    
    try {
      const data = await bookApi.getInstances(book.MaDauSach);
      const instances = (Array.isArray(data) ? data : []).filter(
        (i: any) => i.TrangThai === 'Sẵn sàng' || i.TrangThai === 'Sẵn Sàng'
      );
      
      if (instances.length === 0) {
        toast.error('Không tìm thấy cuốn sách nào sẵn sàng để mượn');
        return;
      }
      
      setAvailableInstances({ bookId: book.MaDauSach, instances });
    } catch (error) {
      toast.error('Lấy danh sách cuốn sách thất bại');
    }
  };

  const addInstanceToSelection = (instance: any, tenSach: string) => {
    if (selectedInstances.find(i => i.MaCuonSach === instance.MaCuonSach)) {
      toast.error('Cuốn sách này đã được chọn');
      return;
    }
    setSelectedInstances([...selectedInstances, { MaCuonSach: instance.MaCuonSach, TenSach: tenSach }]);
    setAvailableInstances(null);
  };

  const removeInstanceFromSelection = (maCuonSach: string) => {
    setSelectedInstances(selectedInstances.filter(i => i.MaCuonSach !== maCuonSach));
  };

  const filteredTickets = tickets.filter(t =>
    t.MaPM?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.MaDocGia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.TenDocGia || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableBooks = books.filter(b =>
    b.TenSach.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.TacGia.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const getStatusStyle = (ticket: BorrowTicket) => {
    const isOverdue = ticket.NgayTraDuKien && new Date(ticket.NgayTraDuKien) < new Date();
    const isReturned = ticket.TrangThaiPhieu === 'Hoàn tất' || ticket.TrangThaiPhieu === 'Đã trả';
    if (isReturned) return { label: 'Đã trả', cls: 'bg-[#e8f7ec] text-[#1aae39]' };
    if (isOverdue) return { label: 'Quá hạn', cls: 'bg-[#fff0e6] text-[#dd5b00]' };
    return { label: 'Đang mượn', cls: 'bg-notion-badgeBg text-notion-badgeText' };
  };

  const detailBooks: any[] = ticketDetail
    ? Array.isArray(ticketDetail) ? ticketDetail : ticketDetail?.books || []
    : selectedTicket?.books || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Mượn & Trả Sách</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Quản lý phiếu mượn và trả sách.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Tạo Phiếu Mượn
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-notion-bg p-5 rounded-2xl shadow-notion-card border border-notion-border flex flex-col md:flex-row gap-4">
        <div className="flex items-center flex-1 min-w-[200px] border border-[#dddddd] rounded px-3 focus-within:ring-1 focus-within:ring-notion-focus focus-within:border-notion-focus transition-colors">
          <Search className="text-notion-textMuted w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, mã/tên độc giả..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-notion-text placeholder-notion-textMuted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-notion-textSecondary whitespace-nowrap">Từ:</span>
            <input type="date" className="px-3 py-1.5 border border-[#dddddd] rounded text-sm text-notion-text outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus" value={tuNgay} onChange={e => setTuNgay(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-notion-textSecondary whitespace-nowrap">Đến:</span>
            <input type="date" className="px-3 py-1.5 border border-[#dddddd] rounded text-sm text-notion-text outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus" value={denNgay} onChange={e => setDenNgay(e.target.value)} />
          </div>
          <Button onClick={fetchData} variant="secondary" className="whitespace-nowrap font-semibold">Lọc</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã phiếu</TableHead>
            <TableHead>Mã độc giả</TableHead>
            <TableHead>Ngày mượn</TableHead>
            <TableHead>Hạn trả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell></TableRow>
          ) : filteredTickets.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-notion-textSecondary font-medium">Không tìm thấy phiếu mượn nào.</TableCell></TableRow>
          ) : (
            filteredTickets.map((ticket) => {
              const status = getStatusStyle(ticket);
              const isOverdue = ticket.NgayTraDuKien && new Date(ticket.NgayTraDuKien) < new Date();
              return (
                <TableRow key={ticket.MaPM}>
                  <TableCell className="font-semibold text-notion-text">{ticket.MaPM}</TableCell>
                  <TableCell>{ticket.TenDocGia || ticket.MaDocGia}</TableCell>
                  <TableCell>{formatDisplayDate(ticket.NgayMuon)}</TableCell>
                  <TableCell>
                    <span className={isOverdue && status.label !== 'Đã trả' ? 'text-red-600 font-semibold' : ''}>
                      {formatDisplayDate(ticket.NgayTraDuKien)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-notion-badge ${status.cls}`}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="secondary" size="sm" onClick={() => handleViewDetail(ticket)}>
                      <Eye className="w-4 h-4 mr-1" /> Xem
                    </Button>
                    {status.label !== 'Đã trả' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(ticket); setNewDeadline(ticket.NgayTraDuKien?.split('T')[0] || ''); setIsExtendModalOpen(true); }} title="Gia hạn">
                          <Clock className="w-4 h-4 text-amber-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ticket.MaPM)} title="Hủy phiếu">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tạo Phiếu Mượn Sách" maxWidth="3xl">
        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-notion-text mb-3 tracking-notion-title">1. Chọn Độc giả</h3>
              <select
                className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm bg-white text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none"
                value={maDocGia}
                onChange={(e) => setMaDocGia(e.target.value)}
                required
              >
                <option value="">-- Chọn độc giả --</option>
                {readers.filter(r => r.TrangThai !== 'Bị Khóa' && r.TrangThai !== 'Bị khóa').map(r => (
                  <option key={r.MaDocGia} value={r.MaDocGia}>{r.HoTen} ({r.MaDocGia})</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-notion-text mb-3 tracking-notion-title">2. Sách đã chọn ({selectedInstances.length})</h3>
              {selectedInstances.length === 0 ? (
                <div className="text-sm text-notion-textMuted italic p-3 bg-notion-warmBg rounded border border-notion-border">Chưa chọn cuốn sách nào.</div>
              ) : (
                <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {selectedInstances.map(item => (
                    <li key={item.MaCuonSach} className="flex justify-between items-center p-2 bg-[#f2f9ff] text-[#097fe8] rounded text-sm border border-[#0075de]/20">
                      <div className="min-w-0">
                        <p className="font-semibold text-xs opacity-75">{item.MaCuonSach}</p>
                        <p className="truncate text-sm">{item.TenSach}</p>
                      </div>
                      <button type="button" onClick={() => removeInstanceFromSelection(item.MaCuonSach)} className="text-primary-400 hover:text-red-500 flex-shrink-0 ml-2">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-notion-border">
            <div>
              <h3 className="text-sm font-semibold text-notion-text mb-3 tracking-notion-title">3. Ngày trả dự kiến</h3>
              <Input 
                type="date" 
                value={createTicketDeadline} 
                onChange={e => setCreateTicketDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="border-t border-notion-border pt-4">
            <h3 className="text-sm font-semibold text-notion-text mb-3 tracking-notion-title">4. Tìm & Thêm Sách</h3>
            <Input placeholder="Tìm sách theo tên hoặc tác giả..." value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} className="mb-4" />
            
            {availableInstances && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-amber-900">Chọn Mã cuốn sách cho: {books.find(b => b.MaDauSach === availableInstances.bookId)?.TenSach}</h4>
                  <button type="button" onClick={() => setAvailableInstances(null)} className="text-amber-500 hover:text-amber-700">✕</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableInstances.instances.map(inst => (
                    <button
                      key={inst.MaCuonSach}
                      type="button"
                      onClick={() => addInstanceToSelection(inst, books.find(b => b.MaDauSach === availableInstances.bookId)?.TenSach || '')}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      {inst.MaCuonSach} ({inst.TinhTrang || 'Bình thường'})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {filteredAvailableBooks.slice(0, 12).map(book => {
                const isSelected = !!selectedInstances.find(i => i.MaCuonSach.startsWith(book.MaDauSach)); // Simple check
                const isOut = (book.Quantity || 0) <= 0;
                return (
                  <div
                    key={book.MaDauSach}
                    onClick={() => !isOut && handleBookClick(book)}
                    className={`p-3 border rounded cursor-pointer transition-all ${availableInstances?.bookId === book.MaDauSach ? 'border-notion-focus bg-notion-badgeBg ring-1 ring-notion-focus' : isOut ? 'border-notion-border bg-notion-warmBg opacity-60 cursor-not-allowed' : 'border-[#dddddd] hover:border-notion-focus hover:shadow-notion-card'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="pr-2 min-w-0">
                        <h4 className="font-semibold text-sm text-notion-text line-clamp-1 tracking-notion-body">{book.TenSach}</h4>
                        <p className="text-xs text-notion-textSecondary mt-0.5 truncate">{book.TacGia}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-notion-blue flex-shrink-0" />}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-notion-textSecondary">
                      Kho: <span className={isOut ? 'text-[#dd5b00]' : 'text-[#1aae39]'}>{book.Quantity ?? 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-notion-border">
            <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button type="submit">Tạo Phiếu Mượn</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Chi tiết Phiếu Mượn" maxWidth="lg">
        {selectedTicket && (
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-notion-textSecondary mb-1">Mã phiếu</p><p className="font-semibold text-notion-text">{selectedTicket.MaPM}</p></div>
              <div><p className="text-notion-textSecondary mb-1">Độc giả</p><p className="font-semibold text-notion-text">{selectedTicket.TenDocGia || selectedTicket.MaDocGia}</p></div>
              <div><p className="text-notion-textSecondary mb-1">Nhân viên lập</p><p className="font-semibold text-notion-text">{selectedTicket.NhanVienLap || '—'}</p></div>
              <div><p className="text-notion-textSecondary mb-1">Trạng thái</p><p className="font-semibold text-notion-text">{selectedTicket.TrangThaiPhieu}</p></div>
              <div><p className="text-notion-textSecondary mb-1">Ngày mượn</p><p className="font-semibold text-notion-text">{formatDisplayDate(selectedTicket.NgayMuon)}</p></div>
              <div>
                <p className="text-notion-textSecondary mb-1">Hạn trả</p>
                <p className={`font-semibold ${selectedTicket.NgayTraDuKien && new Date(selectedTicket.NgayTraDuKien) < new Date() && selectedTicket.TrangThaiPhieu !== 'Hoàn tất' ? 'text-[#dd5b00]' : 'text-notion-text'}`}>
                  {formatDisplayDate(selectedTicket.NgayTraDuKien)}
                </p>
              </div>
            </div>

            <div className="border-t border-notion-border pt-4">
              <h3 className="font-bold text-notion-text mb-3 tracking-notion-title">Sách trong phiếu</h3>
              {detailBooks.length > 0 ? (
                <ul className="space-y-2">
                  {detailBooks.map((book: any, idx: number) => {
                    const isReturned = book.TrangThaiMuonTra === 'Đã trả' || !!book.NgayTraThucTe;
                    const isSelected = selectedReturnBooks.includes(book.MaCuonSach);
                    return (
                      <li 
                        key={idx} 
                        onClick={() => !isReturned && toggleReturnSelection(book.MaCuonSach)}
                        className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isReturned ? 'bg-notion-warmBg border-transparent opacity-60' : isSelected ? 'bg-notion-badgeBg border-notion-focus ring-1 ring-notion-focus' : 'bg-notion-bg border-notion-border hover:border-notion-focus cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          {!isReturned && (
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-notion-blue border-notion-blue' : 'bg-white border-[#dddddd]'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-notion-text">{book.TenSach || `Cuốn: ${book.MaCuonSach}`}</p>
                            <p className="text-xs text-notion-textMuted mt-0.5 font-medium">Mã: {book.MaCuonSach}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-notion-badge ${isReturned ? 'bg-[#e8f7ec] text-[#1aae39]' : 'bg-notion-badgeBg text-notion-badgeText'}`}>
                            {isReturned ? 'Đã trả' : 'Đang mượn'}
                          </span>
                          {book.NgayTraThucTe && <p className="text-[10px] text-notion-textMuted mt-1 font-medium">{formatDisplayDate(book.NgayTraThucTe)}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (ticketDetail?.DanhSachCuonSach || selectedTicket?.DanhSachCuonSach) ? (
                <ul className="space-y-2">
                  {(ticketDetail?.DanhSachCuonSach || selectedTicket?.DanhSachCuonSach).split(', ').map((item: string, idx: number) => {
                    const match = item.match(/^(.*) - (.*) \((.*)\)$/);
                    const title = match ? match[1] : item;
                    const bookId = match ? match[2] : '';
                    const status = match ? match[3] : '';
                    const isReturned = status === 'Đã trả' || status === 'Hoàn tất';
                    const isSelected = selectedReturnBooks.includes(bookId);
                    
                    return (
                      <li 
                        key={idx} 
                        onClick={() => !isReturned && bookId && toggleReturnSelection(bookId)}
                        className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isReturned ? 'bg-notion-warmBg border-transparent opacity-60' : isSelected ? 'bg-notion-badgeBg border-notion-focus ring-1 ring-notion-focus' : 'bg-notion-bg border-notion-border hover:border-notion-focus cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          {!isReturned && bookId && (
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-notion-blue border-notion-blue' : 'bg-white border-[#dddddd]'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          )}
                          <p className="text-sm text-notion-text font-semibold">{title} {bookId && <span className="text-xs text-notion-textMuted ml-1 font-medium">({bookId})</span>}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-notion-badge ${isReturned ? 'bg-[#e8f7ec] text-[#1aae39]' : 'bg-notion-badgeBg text-notion-badgeText'}`}>
                          {status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-notion-textMuted italic">Không có chi tiết sách.</p>
              )}
            </div>
            <div className="flex justify-between items-center pt-5 border-t border-notion-border">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setIsDetailModalOpen(false); setSelectedReturnBooks([]); }}>Đóng</Button>
                {selectedReturnBooks.length > 0 && selectedTicket.TrangThaiPhieu !== 'Hoàn tất' && selectedTicket.TrangThaiPhieu !== 'Đã trả' && (
                  <Button onClick={() => handleReturnOne(selectedTicket.MaPM, selectedReturnBooks)}>
                    Trả sách đã chọn ({selectedReturnBooks.length})
                  </Button>
                )}
              </div>
              {selectedTicket.TrangThaiPhieu !== 'Hoàn tất' && selectedTicket.TrangThaiPhieu !== 'Đã trả' && (
                <Button onClick={() => handleReturnAll(selectedTicket)} variant="ghost" className="text-[#dd5b00] hover:bg-[#fff0e6]">Trả Tất Cả</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Extend Deadline Modal */}
      <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} title="Gia hạn Phiếu Mượn" maxWidth="sm">
        <form onSubmit={handleExtend} className="mt-4 space-y-4">
          <div className="text-sm text-notion-textSecondary">
            Phiếu mượn: <span className="font-bold text-notion-text">{selectedTicket?.MaPM}</span>
          </div>
          <Input
            label="Ngày trả mới"
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsExtendModalOpen(false)}>Hủy</Button>
            <Button type="submit">Gia hạn</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowList;
