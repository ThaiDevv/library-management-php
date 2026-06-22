import { useState, useEffect } from 'react';
import { staffApi, type Staff } from '../../services/api/staff.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffList = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<Staff>({
    MaNV: '',
    HoTen: '',
    SDT: '',
    vaitro: 'NHANVIEN',
    password: '',
  });

  const fetchStaffs = async () => {
    try {
      setIsLoading(true);
      const data = await staffApi.getAll();
      setStaffs(data);
    } catch (error) {
      toast.error('Lấy danh sách nhân viên thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaffs(); }, []);

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        MaNV: staff.MaNV || '',
        HoTen: staff.HoTen || '',
        SDT: staff.SDT || '',
        vaitro: staff.vaitro || 'NHANVIEN',
        password: '',
      });
    } else {
      setEditingStaff(null);
      setFormData({ MaNV: '', HoTen: '', SDT: '', vaitro: 'NHANVIEN', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff && editingStaff.MaNV) {
        const { password, ...updateData } = formData;
        const dataToUpdate = password ? formData : updateData;
        await staffApi.update(editingStaff.MaNV, dataToUpdate);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await staffApi.create(formData);
        toast.success('Thêm nhân viên thành công');
      }
      setIsModalOpen(false);
      fetchStaffs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    try {
      await staffApi.delete(id);
      toast.success('Xóa nhân viên thành công');
      fetchStaffs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa nhân viên thất bại');
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-[#fff0e6] text-[#dd5b00]',
    NHANVIEN: 'bg-notion-badgeBg text-notion-badgeText',
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[40px] font-bold text-notion-text tracking-notion-h1 leading-tight">Quản lý Nhân viên</h1>
          <p className="text-base text-notion-textSecondary mt-2 font-medium">Danh sách nhân viên và tài khoản hệ thống.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Nhân viên
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã NV</TableHead>
            <TableHead>Họ Tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-notion-textSecondary">Đang tải...</TableCell></TableRow>
          ) : staffs.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-notion-textSecondary">Không tìm thấy nhân viên nào.</TableCell></TableRow>
          ) : (
            staffs.map((staff) => (
              <TableRow key={staff.MaNV}>
                <TableCell className="font-semibold text-notion-text">{staff.MaNV}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f2f9ff] border border-notion-border flex items-center justify-center text-[#097fe8] font-bold text-sm flex-shrink-0">
                      {staff.HoTen?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-notion-text tracking-notion-body">{staff.HoTen}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-notion-text font-medium">{staff.DienThoai || staff.SDT || '—'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-notion-badge ${roleColors[staff.vaitro || ''] || 'bg-gray-100 text-gray-700'}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {staff.vaitro === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(staff)}>
                    <Edit2 className="w-4 h-4 text-notion-blue" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(staff.MaNV)}>
                    <Trash2 className="w-4 h-4 text-[#dd5b00]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên Mới'} maxWidth="2xl">
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Mã nhân viên" value={formData.MaNV} onChange={(e) => setFormData({ ...formData, MaNV: e.target.value })} disabled={!!editingStaff} required placeholder="NV001" />
          <Input label="Họ Tên" value={formData.HoTen} onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })} required />
          <Input label="Số điện thoại" value={formData.SDT} onChange={(e) => setFormData({ ...formData, SDT: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-notion-textSecondary mb-1">Vai trò</label>
            <select className="w-full px-3 py-1.5 border border-[#dddddd] rounded text-sm bg-notion-bg text-notion-text outline-none focus:ring-1 focus:ring-notion-focus focus:border-notion-focus" value={formData.vaitro} onChange={(e) => setFormData({ ...formData, vaitro: e.target.value })}>
              <option value="NHANVIEN">Nhân viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
          <Input label={editingStaff ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu'} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingStaff} />
          <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-notion-border mt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">{editingStaff ? 'Lưu Thay Đổi' : 'Thêm Nhân viên'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffList;
