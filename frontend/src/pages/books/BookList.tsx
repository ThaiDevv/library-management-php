import { useState, useEffect } from 'react';
import { bookApi, type Book } from '../../services/api/book.api';
import { categoryApi, type Category } from '../../services/api/category.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, Package, PackagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [importQty, setImportQty] = useState(1);
  const [instances, setInstances] = useState<any[]>([]);

  const [searchName, setSearchName] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const [formData, setFormData] = useState({
    MaDauSach: '',
    TenSach: '',
    MaTheLoai: '',
    TacGia: '',
    NamXuatBan: new Date().getFullYear(),
  });

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookApi.getAll({
        TenSach: searchName || undefined,
        TacGia: searchAuthor || undefined,
        MaTheLoai: searchCategory || undefined,
      });
      setBooks(data);
    } catch (error) {
      toast.error('Lấy danh sách sách thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      let list = data;
      if (Array.isArray(list) && Array.isArray(list[0])) list = list[0];
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lấy danh sách thể loại thất bại', error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(), 500);
    return () => clearTimeout(timer);
  }, [searchName, searchAuthor, searchCategory]);

  const handleOpenModal = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        MaDauSach: book.MaDauSach,
        TenSach: book.TenSach,
        MaTheLoai: book.MaTheLoai,
        TacGia: book.TacGia,
        NamXuatBan: book.NamXuatBan || new Date().getFullYear(),
      });
    } else {
      setEditingBook(null);
      setFormData({
        MaDauSach: '',
        TenSach: '',
        MaTheLoai: categories[0]?.MaTheLoai || '',
        TacGia: '',
        NamXuatBan: new Date().getFullYear(),
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenInstanceModal = async (book: Book) => {
    setSelectedBookId(book.MaDauSach);
    setImportQty(1);
    try {
      const data = await bookApi.getInstances(book.MaDauSach);
      let list = data;
      if (Array.isArray(list) && Array.isArray(list[0])) list = list[0];
      setInstances(Array.isArray(list) ? list : []);
    } catch {
      setInstances([]);
    }
    setIsInstanceModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await bookApi.update(editingBook.MaDauSach, {
          TenSach: formData.TenSach || undefined,
          MaTheLoai: formData.MaTheLoai || undefined,
          TacGia: formData.TacGia || undefined,
          NamXB: formData.NamXuatBan ? Number(formData.NamXuatBan) : undefined,
        });
        toast.success('Cập nhật sách thành công');
      } else {
        await bookApi.create({
          MaDauSach: formData.MaDauSach,
          TenSach: formData.TenSach,
          MaTheLoai: formData.MaTheLoai,
          TacGia: formData.TacGia,
          NamXB: Number(formData.NamXuatBan),
        });
        toast.success('Thêm sách thành công');
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đầu sách này không?')) return;
    try {
      await bookApi.delete(id);
      toast.success('Xóa sách thành công');
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa sách thất bại');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookApi.addInstance(selectedBookId, importQty);
      toast.success(`Nhập kho thành công ${importQty} cuốn`);
      // Refresh instances
      const data = await bookApi.getInstances(selectedBookId);
      let list = data;
      if (Array.isArray(list) && Array.isArray(list[0])) list = list[0];
      setInstances(Array.isArray(list) ? list : []);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nhập kho thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Quản lý Sách</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Quản lý đầu sách và kho sách vật lý.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Đầu sách
        </Button>
      </div>

      {/* Search filters */}
      <div className="bg-notion-bg p-5 rounded-2xl shadow-notion-card border border-notion-border grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-textMuted w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên sách..."
            className="w-full pl-9 pr-3 py-2 border border-[#dddddd] rounded text-sm text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none transition-colors"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-textMuted w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tác giả..."
            className="w-full pl-9 pr-3 py-2 border border-[#dddddd] rounded text-sm text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none transition-colors"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
          />
        </div>
        <select
          className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm bg-white text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none transition-colors"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        >
          <option value="">Tất cả Thể loại</option>
          {categories.map((cat) => (
            <option key={cat.MaTheLoai} value={cat.MaTheLoai}>{cat.TenTheLoai}</option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã sách</TableHead>
            <TableHead>Tên sách</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Thể loại</TableHead>
            <TableHead>Năm XB</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell></TableRow>
          ) : books.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-notion-textSecondary font-medium">Không tìm thấy sách nào.</TableCell></TableRow>
          ) : (
            books.map((book) => {
              const category = categories.find((c) => c.MaTheLoai === book.MaTheLoai);
              const qty = (book as any).SoLuongTon ?? book.Quantity ?? 0;
              return (
                <TableRow key={book.MaDauSach}>
                  <TableCell className="font-semibold text-notion-text">{book.MaDauSach}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-notion-text tracking-notion-body">{book.TenSach}</div>
                  </TableCell>
                  <TableCell>{book.TacGia}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-notion-badge uppercase bg-notion-badgeBg text-notion-badgeText">
                      {category?.TenTheLoai || book.MaTheLoai}
                    </span>
                  </TableCell>
                  <TableCell>{book.NamXuatBan || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-notion-badge uppercase ${qty > 0 ? 'bg-[#e8f7ec] text-[#1aae39]' : 'bg-[#fff0e6] text-[#dd5b00]'}`}>
                      <Package className="w-3 h-3" />
                      {qty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenInstanceModal(book)} title="Nhập kho / Xem bản sao">
                      <PackagePlus className="w-4 h-4 text-[#1aae39]" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(book)}>
                      <Edit2 className="w-4 h-4 text-notion-blue" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(book.MaDauSach)}>
                      <Trash2 className="w-4 h-4 text-[#dd5b00]" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Book Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBook ? 'Sửa Đầu Sách' : 'Thêm Đầu Sách Mới'} maxWidth="2xl">
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <Input label="Tên sách" value={formData.TenSach} onChange={(e) => setFormData({ ...formData, TenSach: e.target.value })} required />
          </div>
          <Input
            label="Mã đầu sách"
            value={formData.MaDauSach}
            onChange={(e) => setFormData({ ...formData, MaDauSach: e.target.value })}
            disabled={!!editingBook}
            required
            placeholder="VD: DS001"
          />
          <div>
            <label className="block text-sm font-semibold text-notion-text mb-1 tracking-notion-title">Thể loại</label>
            <select
              className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm bg-white text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none"
              value={formData.MaTheLoai}
              onChange={(e) => setFormData({ ...formData, MaTheLoai: e.target.value })}
              required
            >
              <option value="" disabled>Chọn thể loại</option>
              {categories.map((cat) => (
                <option key={cat.MaTheLoai} value={cat.MaTheLoai}>{cat.TenTheLoai}</option>
              ))}
            </select>
          </div>
          <Input label="Tác giả" value={formData.TacGia} onChange={(e) => setFormData({ ...formData, TacGia: e.target.value })} required />
          <Input
            label="Năm xuất bản"
            type="number"
            value={formData.NamXuatBan}
            onChange={(e) => setFormData({ ...formData, NamXuatBan: Number(e.target.value) })}
            required
            min="1000"
            max={new Date().getFullYear()}
          />
          <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-notion-border mt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">{editingBook ? 'Lưu Thay Đổi' : 'Thêm Sách'}</Button>
          </div>
        </form>
      </Modal>

      {/* Instance/Import Modal */}
      <Modal isOpen={isInstanceModalOpen} onClose={() => setIsInstanceModalOpen(false)} title={`Kho sách: ${selectedBookId}`} maxWidth="2xl">
        <div className="mt-4 space-y-5">
          <form onSubmit={handleImport} className="flex items-end gap-3 p-4 bg-[#f2f9ff] rounded-xl border border-[#0075de]/20">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-notion-text mb-1 tracking-notion-title">Số lượng nhập kho</label>
              <input
                type="number"
                min={1}
                value={importQty}
                onChange={e => setImportQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none text-notion-text"
              />
            </div>
            <Button type="submit" className="flex items-center gap-1 whitespace-nowrap">
              <PackagePlus className="w-4 h-4" />
              Nhập kho
            </Button>
          </form>

          <div>
            <h4 className="font-bold text-notion-text mb-3 flex items-center gap-2 tracking-notion-title">
              <Package className="w-4 h-4 text-notion-textSecondary" />
              Danh sách bản sao ({instances.length})
            </h4>
            {instances.length === 0 ? (
              <p className="text-sm text-notion-textMuted italic text-center py-4">Chưa có bản sao nào.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {instances.map((inst: any, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-notion-bg rounded border border-notion-border text-sm">
                    <span className="font-semibold text-notion-text">{inst.MaCuonSach}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-notion-badge uppercase ${inst.TinhTrang === 'Đang mượn' ? 'bg-[#fff0e6] text-[#dd5b00]' : 'bg-[#e8f7ec] text-[#1aae39]'}`}>
                      {inst.TinhTrang || 'Sẵn sàng'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsInstanceModalOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookList;
