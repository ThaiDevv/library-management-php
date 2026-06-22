import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Tags,
  Library,
  UserCheck,
  Receipt,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  {
    group: 'Tổng quan',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
    ],
  },
  {
    group: 'Kho sách',
    items: [
      { name: 'Đầu sách', href: '/books', icon: BookOpen, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
      { name: 'Thể loại', href: '/categories', icon: Tags, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
    ],
  },
  {
    group: 'Nghiệp vụ',
    items: [
      { name: 'Độc giả', href: '/readers', icon: UserCheck, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
      { name: 'Mượn & Trả', href: '/borrow-tickets', icon: Library, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
      { name: 'Tiền phạt', href: '/fines', icon: Receipt, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
    ],
  },
  {
    group: 'Báo cáo',
    items: [
      { name: 'Thống kê', href: '/reports', icon: BarChart3, roles: ['Admin', 'Staff', 'NHANVIEN', 'ADMIN'] },
    ],
  },
  {
    group: 'Quản trị',
    items: [
      { name: 'Nhân viên', href: '/staffs', icon: ShieldCheck, roles: ['Admin', 'ADMIN'] },
    ],
  },
];

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => location.pathname.startsWith(href);

  const NavLink = ({ item, onClick }: { item: { name: string; href: string; icon: any }; onClick?: () => void }) => {
    const active = isActive(item.href);
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          active
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <item.icon className={cn('w-4 h-4 mr-3 flex-shrink-0 transition-colors', active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500')} />
        {item.name}
      </Link>
    );
  };

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex-1 overflow-y-auto py-4 space-y-4">
      {navigation.map((group) => {
        const visibleItems = group.items.filter(item => item.roles.includes(user?.role || ''));
        if (visibleItems.length === 0) return null;
        return (
          <div key={group.group}>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{group.group}</p>
            <nav className="space-y-0.5">
              {visibleItems.map((item) => (
                <NavLink key={item.name} item={item} onClick={onLinkClick} />
              ))}
            </nav>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
            <span className="text-xl font-bold text-primary-600">LMS</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          <div className="px-3 py-4 border-t border-gray-100">
            <button
              onClick={() => { setSidebarOpen(false); handleLogout(); }}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center flex-shrink-0 px-6 mb-2">
          <span className="text-2xl font-black text-primary-600 tracking-tight">LMS<span className="text-gray-900">.</span></span>
          <span className="ml-2 text-xs text-gray-400 font-medium">Thư viện</span>
        </div>
        <SidebarContent />
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
              {user?.sub?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="ml-2 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.sub}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 lg:border-none">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="flex-1 flex items-center">
              {/* Breadcrumb could go here */}
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {user?.sub?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{user?.sub}</p>
                  <p className="text-xs text-gray-400">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8 mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
