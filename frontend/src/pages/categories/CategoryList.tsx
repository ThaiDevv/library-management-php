import { useState, useEffect } from 'react';
import { categoryApi, type Category } from '../../services/api/category.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<Category>({ MaTheLoai: '', TenTheLoai: '', MoTa: '' });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryApi.getAll();
      let list = data;
      if (Array.isArray(list) && Array.isArray(list[0])) list = list[0];
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error('Lấy danh sách thể loại thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ MaTheLoai: category.MaTheLoai, TenTheLoai: category.TenTheLoai, MoTa: category.MoTa || '' });
    } else {
      setEditingCategory(null);
      setFormData({ MaTheLoai: '', TenTheLoai: '', MoTa: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.MaTheLoai, {
          TenTheLoai: formData.TenTheLoai || null,
          MoTa: formData.MoTa || null,
        } as any);
        toast.success('Cập nhật thể loại thành công');
      } else {
        await categoryApi.create(formData);
        toast.success('Thêm thể loại thành công');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thể loại này không? (Không thể xóa nếu đang có sách liên kết)')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Xóa thể loại thành công');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thể loại thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Quản lý Thể loại</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Quản lý các thể loại sách trong thư viện.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Thể loại
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã thể loại</TableHead>
            <TableHead>Tên thể loại</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell></TableRow>
          ) : categories.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center py-8 text-notion-textSecondary font-medium">Không tìm thấy thể loại nào.</TableCell></TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.MaTheLoai}>
                <TableCell className="font-semibold text-notion-text">{category.MaTheLoai}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-notion-badge uppercase bg-notion-badgeBg text-notion-badgeText">
                    {category.TenTheLoai}
                  </span>
                </TableCell>
                <TableCell className="text-notion-textSecondary text-sm font-medium">{category.MoTa || '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(category)}>
                    <Edit2 className="w-4 h-4 text-notion-blue" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.MaTheLoai)}>
                    <Trash2 className="w-4 h-4 text-[#dd5b00]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Sửa Thể loại' : 'Thêm Thể loại Mới'}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            label="Mã thể loại"
            value={formData.MaTheLoai}
            onChange={(e) => setFormData({ ...formData, MaTheLoai: e.target.value })}
            disabled={!!editingCategory}
            required
            placeholder="VD: CNTT"
          />
          <Input
            label="Tên thể loại"
            value={formData.TenTheLoai}
            onChange={(e) => setFormData({ ...formData, TenTheLoai: e.target.value })}
            required={!editingCategory}
            placeholder="VD: Công nghệ thông tin"
          />
          <div>
            <label className="block text-sm font-semibold text-notion-text mb-1 tracking-notion-title">Mô tả</label>
            <textarea
              className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm text-notion-text focus:ring-1 focus:ring-notion-focus focus:border-notion-focus outline-none transition-colors"
              rows={3}
              value={formData.MoTa}
              onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
              placeholder="Mô tả ngắn về thể loại..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-notion-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">{editingCategory ? 'Lưu Thay Đổi' : 'Thêm Thể loại'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryList;
