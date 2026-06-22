import { useState, useEffect, useCallback } from 'react';
import { readerApi, type Reader } from '../../services/api/reader.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Lock, Unlock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ReaderList = () => {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [formData, setFormData] = useState<Reader>({
    MaDocGia: '',
    HoTen: '',
    NgaySinh: '',
    DiaChi: '',
    SDT: '',
  });

  const fetchReaders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await readerApi.getAll(searchTerm || undefined);
      setReaders(data);
    } catch (error) {
      toast.error('Lấy danh sách độc giả thất bại');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchReaders();
  }, [fetchReaders]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleOpenModal = (reader?: Reader) => {
    if (reader) {
      setEditingReader(reader);
      setFormData({
        MaDocGia: reader.MaDocGia,
        HoTen: reader.HoTen,
        NgaySinh: reader.NgaySinh?.split('T')[0] || '',
        DiaChi: reader.DiaChi || '',
        SDT: reader.SDT || '',
      });
    } else {
      setEditingReader(null);
      setFormData({ MaDocGia: '', HoTen: '', NgaySinh: '', DiaChi: '', SDT: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReader) {
        await readerApi.update(editingReader.MaDocGia, {
          HoTen: formData.HoTen || null,
          NgaySinh: formData.NgaySinh || null,
          DiaChi: formData.DiaChi || null,
          SDT: formData.SDT || null,
        } as any);
        toast.success('Cập nhật độc giả thành công');
      } else {
        await readerApi.create(formData as any);
        toast.success('Thêm độc giả thành công');
      }
      setIsModalOpen(false);
      fetchReaders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleLock = async (id: string) => {
    if (!window.confirm('Khóa thẻ độc giả này?')) return;
    try {
      await readerApi.lock(id);
      toast.success('Đã khóa thẻ độc giả');
      fetchReaders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Khóa thẻ thất bại');
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await readerApi.unlock(id);
      toast.success('Đã mở khóa thẻ độc giả');
      fetchReaders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mở khóa thất bại');
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Quản lý Độc giả</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Danh sách độc giả và trạng thái thẻ thư viện.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Độc giả
        </Button>
      </div>

      <div className="bg-notion-bg p-5 rounded-2xl shadow-notion-card border border-notion-border flex gap-3">
        <div className="flex items-center flex-1 border border-[#dddddd] rounded px-3 focus-within:ring-1 focus-within:ring-notion-focus focus-within:border-notion-focus transition-colors">
          <Search className="text-notion-textMuted w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-notion-text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">Tìm</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã độc giả</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell>
            </TableRow>
          ) : readers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-notion-textSecondary font-medium">Không tìm thấy độc giả nào.</TableCell>
            </TableRow>
          ) : (
            readers.map((reader) => {
              const isLocked = reader.TrangThai === 'Bị Khóa' || reader.TrangThai === 'Bị khóa';
              return (
                <TableRow key={reader.MaDocGia}>
                  <TableCell className="font-semibold text-notion-text">{reader.MaDocGia}</TableCell>
                  <TableCell className="font-semibold text-notion-text tracking-notion-body">{reader.HoTen}</TableCell>
                  <TableCell>{reader.NgaySinh ? new Date(reader.NgaySinh).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell>{reader.DienThoai || reader.SDT || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{reader.DiaChi || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-notion-badge uppercase ${isLocked ? 'bg-[#fff0e6] text-[#dd5b00]' : 'bg-[#e8f7ec] text-[#1aae39]'}`}>
                      {reader.TrangThai || 'Hoạt động'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(reader)} title="Chỉnh sửa">
                      <Edit2 className="w-4 h-4 text-notion-blue" />
                    </Button>
                    {isLocked ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUnlock(reader.MaDocGia)} title="Mở khóa">
                        <Unlock className="w-4 h-4 text-[#1aae39]" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleLock(reader.MaDocGia)} title="Khóa thẻ">
                        <Lock className="w-4 h-4 text-[#dd5b00]" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingReader ? 'Cập nhật Độc giả' : 'Thêm Độc giả Mới'} maxWidth="2xl">
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã độc giả"
            value={formData.MaDocGia}
            onChange={(e) => setFormData({ ...formData, MaDocGia: e.target.value })}
            disabled={!!editingReader}
            required
            placeholder="VD: DG001"
          />
          <Input
            label="Họ tên"
            value={formData.HoTen}
            onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
            required={!editingReader}
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.NgaySinh}
            onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
            required={!editingReader}
          />
          <Input
            label="Số điện thoại"
            value={formData.SDT}
            onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
            placeholder="0901234567"
            required={!editingReader}
          />
          <div className="col-span-1 sm:col-span-2">
            <Input
              label="Địa chỉ"
              value={formData.DiaChi}
              onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
              placeholder="123 Đường ABC, Quận XYZ"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-notion-border mt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">{editingReader ? 'Lưu Thay Đổi' : 'Thêm Độc giả'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReaderList;
