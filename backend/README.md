# 🐘 Backend PHP — Library Management System

Backend PHP thuần (không framework) thay thế NestJS, kết nối MySQL.

## 📁 Cấu trúc thư mục

```
backend-php/
├── index.php                    # Entry point (main.ts)
├── .htaccess                    # Apache rewrite rules
├── config/
│   ├── database.php             # Kết nối MySQL (DatabaseService)
│   └── env.php                  # Biến môi trường
├── core/
│   ├── Router.php               # Bộ định tuyến HTTP
│   ├── Response.php             # JSON response helper
│   └── Auth.php                 # JWT middleware + phân quyền
└── modules/
    ├── auth/
    │   └── AuthController.php   # POST /auth/login, GET /auth/me
    ├── category/
    │   └── CategoryController.php  # CRUD thể loại sách
    ├── book/
    │   └── BookController.php   # CRUD đầu sách + nhập kho
    ├── borrow/
    │   └── BorrowController.php # Quản lý phiếu mượn
    ├── user/
    │   ├── ReadersController.php   # Quản lý độc giả
    │   └── StaffsController.php    # Quản lý nhân viên (ADMIN only)
    ├── fines/
    │   └── FinesController.php  # Quản lý phiếu phạt
    └── report/
        └── ReportController.php # Báo cáo thống kê
```

## 🔄 Tương đương NestJS → PHP

| NestJS                         | PHP                              |
|-------------------------------|----------------------------------|
| `main.ts`                     | `index.php`                     |
| `DatabaseService`             | `config/database.php` (PDO)     |
| `@Controller()` + `@Module()` | `modules/*/Controller.php`      |
| `@UseGuards(AuthGuard())`     | `Auth::requireAuth()`           |
| `@Roles(ADMIN, NHANVIEN)`     | `Auth::requireRole('ADMIN',...)` |
| JWT Strategy                  | `core/Auth.php` (HS256 manual)  |
| bcrypt                        | `password_hash()` / `password_verify()` |
| `CALL StoredProcedure()`      | PDO `prepare()` + `execute()`   |

## 🚀 Cách chạy

### Cách 1: PHP Built-in Server (phát triển)
```bash
cd FullStack-Project-library-management/backend-php
php -S localhost:3000 index.php
```

### Cách 2: XAMPP / WAMP (Apache)
1. Copy thư mục `backend-php/` vào `htdocs/`
2. Truy cập: `http://localhost/backend-php/auth/login`

## ⚙️ Cấu hình Database

Chỉnh sửa file `config/database.php`:
```php
private static string $host     = 'localhost';
private static string $dbname   = 'railway';
private static string $username = 'root';
private static string $password = '';
```

## 📋 API Endpoints

### Auth
| Method | URL           | Mô tả                |
|--------|---------------|----------------------|
| POST   | /auth/login   | Đăng nhập → JWT      |
| GET    | /auth/me      | Thông tin user hiện tại |

### Categories (Thể loại)
| Method | URL                  | Mô tả           |
|--------|----------------------|-----------------|
| GET    | /categories          | Danh sách       |
| POST   | /categories          | Thêm mới        |
| PATCH  | /categories/{id}     | Cập nhật        |
| DELETE | /categories/{id}     | Xóa             |

### Books (Đầu sách)
| Method | URL                      | Mô tả           |
|--------|--------------------------|-----------------|
| GET    | /books                   | Tìm kiếm        |
| GET    | /books/{id}              | Chi tiết        |
| POST   | /books                   | Thêm mới        |
| PATCH  | /books/{id}              | Cập nhật        |
| DELETE | /books/{id}              | Xóa             |
| GET    | /books/{id}/instances    | Cuốn sách vật lý|
| POST   | /books/{id}/instances    | Nhập kho        |

### Borrow Tickets (Phiếu mượn)
| Method | URL                              | Mô tả       |
|--------|----------------------------------|-------------|
| GET    | /borrow-tickets                  | Tìm kiếm    |
| GET    | /borrow-tickets/{id}             | Chi tiết    |
| POST   | /borrow-tickets                  | Tạo mới     |
| DELETE | /borrow-tickets/{id}             | Xóa         |
| PATCH  | /borrow-tickets/{id}/deadline    | Gia hạn     |
| POST   | /borrow-tickets/{id}/books       | Thêm sách   |
| DELETE | /borrow-tickets/{id}/books       | Trả từng cuốn|
| POST   | /borrow-tickets/{id}/return      | Trả tất cả  |

### Readers (Độc giả)
| Method | URL                      | Mô tả           |
|--------|--------------------------|-----------------|
| GET    | /readers                 | Tìm kiếm        |
| GET    | /readers/{id}            | Chi tiết        |
| POST   | /readers                 | Thêm mới        |
| PATCH  | /readers/{id}            | Cập nhật        |
| DELETE | /readers/{id}            | Khóa thẻ        |
| POST   | /readers/{id}/unlock     | Mở khóa         |

### Staffs (Nhân viên — ADMIN only)
| Method | URL             | Mô tả           |
|--------|-----------------|-----------------|
| GET    | /staffs         | Danh sách       |
| GET    | /staffs/{id}    | Chi tiết        |
| POST   | /staffs         | Tạo + tài khoản |
| PATCH  | /staffs/{id}    | Cập nhật        |
| DELETE | /staffs/{id}    | Xóa             |

### Fines (Phiếu phạt)
| Method | URL                      | Mô tả           |
|--------|--------------------------|-----------------|
| GET    | /fines                   | Danh sách       |
| PATCH  | /fines/{id}/pay/{MaNV}   | Thanh toán      |

### Reports (Báo cáo)
| Method | URL                              | Mô tả                    |
|--------|----------------------------------|--------------------------|
| GET    | /reports/books-by-category       | Sách theo thể loại       |
| GET    | /reports/currently-borrowed      | Sách đang mượn           |
| GET    | /reports/borrow-stats            | Thống kê theo thời gian  |
| GET    | /reports/overdue-tickets         | Phiếu quá hạn            |

## 🔐 Authentication

Tất cả routes (trừ `/auth/login`) đều yêu cầu JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### Phân quyền
- `ADMIN`: Toàn quyền (bao gồm quản lý nhân viên)
- `NHANVIEN`: Quyền thao tác (không được quản lý nhân viên)

## 📝 Ví dụ Request

### Đăng nhập
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"MaNV": "NV10", "password": "123456"}'
```

### Lấy danh sách sách (cần token)
```bash
curl http://localhost:3000/books \
  -H "Authorization: Bearer <token>"
```
