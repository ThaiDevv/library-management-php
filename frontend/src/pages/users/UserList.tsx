import { useState, useEffect } from 'react';
import { staffApi as userApi, type Staff as User } from '../../services/api/staff.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<User>({
    MaNV: '',
    HoTen: '',
    SDT: '',
    Email: '',
    DiaChi: '',
    vaitro: 'NHANVIEN',
    password: '',
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Lấy danh sách người dùng thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        MaNV: user.MaNV || '',
        HoTen: user.HoTen || '',
        SDT: user.SDT || '',
        Email: user.Email || '',
        DiaChi: user.DiaChi || '',
        vaitro: user.vaitro || 'NHANVIEN',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        MaNV: '',
        HoTen: '',
        SDT: '',
        Email: '',
        DiaChi: '',
        vaitro: 'NHANVIEN',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser && editingUser.MaNV) {
        const { password, ...updateData } = formData;
        // Only send password if it was changed
        const dataToUpdate = password ? formData : updateData;
        await userApi.update(editingUser.MaNV, dataToUpdate);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await userApi.create(formData);
        toast.success('Thêm người dùng thành công');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;
    try {
      await userApi.delete(id);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Xóa người dùng thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Người dùng & Nhân viên</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Quản lý nhân viên thư viện và người mượn.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Người dùng
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã NV/Thẻ</TableHead>
            <TableHead>Họ Tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-notion-textMuted font-medium">Đang tải...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-notion-textSecondary font-medium">Không tìm thấy người dùng nào.</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.MaNV || user.SDT}>
                <TableCell className="font-semibold text-notion-text">{user.MaNV || 'N/A'}</TableCell>
                <TableCell>
                  <div className="font-semibold text-notion-text tracking-notion-body">{user.HoTen}</div>
                  <div className="text-xs text-notion-textMuted font-medium">{user.Email}</div>
                </TableCell>
                <TableCell className="text-notion-text">{user.SDT}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-notion-badge uppercase ${
                    user.vaitro === 'ADMIN' ? 'bg-[#fff0e6] text-[#dd5b00]' : 'bg-notion-badgeBg text-notion-badgeText'
                  }`}>
                    {user.vaitro || 'Người mượn'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)}>
                    <Edit2 className="w-4 h-4 text-notion-blue" />
                  </Button>
                  {user.MaNV && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.MaNV!)}>
                      <Trash2 className="w-4 h-4 text-[#dd5b00]" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Sửa Người dùng' : 'Thêm Người dùng Mới'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã NV/Thẻ"
            value={formData.MaNV}
            onChange={(e) => setFormData({ ...formData, MaNV: e.target.value })}
            disabled={!!editingUser}
            required
          />
          <Input
            label="Họ Tên"
            value={formData.HoTen}
            onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            value={formData.SDT}
            onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.Email}
            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
          />
          <div className="col-span-1 sm:col-span-2">
            <Input
              label="Địa chỉ"
              value={formData.DiaChi}
              onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-notion-text mb-1 tracking-notion-title">Vai trò</label>
            <select
              className="w-full px-3 py-2 border border-[#dddddd] rounded text-sm text-notion-text bg-white outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus transition-colors"
              value={formData.vaitro}
              onChange={(e) => setFormData({ ...formData, vaitro: e.target.value })}
            >
              <option value="NHANVIEN">Nhân viên</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="BORROWER">Người mượn</option>
            </select>
          </div>
          <Input
            label={editingUser ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
          />
          <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-notion-border mt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {editingUser ? 'Lưu Thay Đổi' : 'Thêm Người dùng'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;
