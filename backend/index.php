<?php
// =========================================================
// index.php — Entry point của PHP REST API
// Tương đương: src/main.ts (NestJS)
//
// Cách dùng:
//   Đặt file này ở root của backend-php/
//   Dùng web server (Apache/Nginx) hoặc PHP built-in server:
//     php -S localhost:3000 -t backend-php/
// =========================================================

declare(strict_types=1);

// ── 1. CORS Headers (cho phép frontend React/Vue gọi API) ──
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── 2. Autoload (thủ công — không dùng Composer) ──────────
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Router.php';

// Controllers
require_once __DIR__ . '/modules/auth/AuthController.php';
require_once __DIR__ . '/modules/category/CategoryController.php';
require_once __DIR__ . '/modules/book/BookController.php';
require_once __DIR__ . '/modules/borrow/BorrowController.php';
require_once __DIR__ . '/modules/user/ReadersController.php';
require_once __DIR__ . '/modules/user/StaffsController.php';
require_once __DIR__ . '/modules/fines/FinesController.php';
require_once __DIR__ . '/modules/report/ReportController.php';

// ── 3. Lấy method và URI ───────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Loại bỏ prefix nếu deploy trong subfolder
// Ví dụ: nếu chạy tại /api thì uncomment dòng sau:
// $uri = preg_replace('#^/api#', '', $uri);

// ── 4. Đăng ký Routes ─────────────────────────────────────
$router = new Router();

// == AUTH ==
// POST /auth/login
$router->post('/auth/login', fn() => AuthController::login());
// GET  /auth/me
$router->get('/auth/me',    fn() => AuthController::getMe());

// == CATEGORIES (thể loại sách) ==
// GET    /categories
$router->get('/categories',      fn() => CategoryController::getAll());
// POST   /categories
$router->post('/categories',     fn() => CategoryController::create());
// PATCH  /categories/{id}
$router->patch('/categories/{id}', fn($p) => CategoryController::update($p));
// DELETE /categories/{id}
$router->delete('/categories/{id}', fn($p) => CategoryController::delete($p));

// == BOOKS (đầu sách + cuốn sách) ==
// GET    /books (+ query: TenSach, TacGia, MaTheLoai)
$router->get('/books',               fn() => BookController::findAll());
// GET    /books/{id}
$router->get('/books/{id}',          fn($p) => BookController::findOne($p));
// POST   /books
$router->post('/books',              fn() => BookController::create());
// PATCH  /books/{id}
$router->patch('/books/{id}',        fn($p) => BookController::update($p));
// DELETE /books/{id}
$router->delete('/books/{id}',       fn($p) => BookController::delete($p));
// GET    /books/{id}/instances
$router->get('/books/{id}/instances',  fn($p) => BookController::findInstances($p));
// POST   /books/{id}/instances
$router->post('/books/{id}/instances', fn($p) => BookController::addInstance($p));

// == BORROW TICKETS (phiếu mượn) ==
// GET    /borrow-tickets
$router->get('/borrow-tickets',                  fn() => BorrowController::findAll());
// GET    /borrow-tickets/{id}
$router->get('/borrow-tickets/{id}',             fn($p) => BorrowController::findOne($p));
// POST   /borrow-tickets
$router->post('/borrow-tickets',                 fn() => BorrowController::create());
// DELETE /borrow-tickets/{id}
$router->delete('/borrow-tickets/{id}',          fn($p) => BorrowController::delete($p));
// PATCH  /borrow-tickets/{id}/deadline (gia hạn)
$router->patch('/borrow-tickets/{id}/deadline',  fn($p) => BorrowController::extendDeadline($p));
// POST   /borrow-tickets/{id}/books (thêm sách vào phiếu)
$router->post('/borrow-tickets/{id}/books',      fn($p) => BorrowController::addBook($p));
// DELETE /borrow-tickets/{id}/books (trả từng cuốn)
$router->delete('/borrow-tickets/{id}/books',    fn($p) => BorrowController::removeBook($p));
// POST   /borrow-tickets/{id}/return (trả tất cả)
$router->post('/borrow-tickets/{id}/return',     fn($p) => BorrowController::returnAll($p));

// == READERS (độc giả) ==
// GET    /readers (+ query: tukhoa)
$router->get('/readers',              fn() => ReadersController::findAll());
// GET    /readers/{id}
$router->get('/readers/{id}',         fn($p) => ReadersController::findOne($p));
// POST   /readers
$router->post('/readers',             fn() => ReadersController::create());
// PATCH  /readers/{id}
$router->patch('/readers/{id}',       fn($p) => ReadersController::update($p));
// DELETE /readers/{id} — Khóa thẻ (soft delete)
$router->delete('/readers/{id}',      fn($p) => ReadersController::lock($p));
// POST   /readers/{id}/unlock — Mở khóa
$router->post('/readers/{id}/unlock', fn($p) => ReadersController::unlock($p));

// == STAFFS (nhân viên — chỉ ADMIN) ==
// GET    /staffs
$router->get('/staffs',         fn() => StaffsController::findAll());
// GET    /staffs/{id}
$router->get('/staffs/{id}',    fn($p) => StaffsController::findOne($p));
// POST   /staffs
$router->post('/staffs',        fn() => StaffsController::create());
// PATCH  /staffs/{id}
$router->patch('/staffs/{id}',  fn($p) => StaffsController::update($p));
// DELETE /staffs/{id}
$router->delete('/staffs/{id}', fn($p) => StaffsController::delete($p));

// == FINES (phiếu phạt) ==
// GET   /fines (+ query: MaDocGia, MaPM)
$router->get('/fines', fn() => FinesController::findAll());
// PATCH /fines/{id}/pay/{MaNV}
$router->patch('/fines/{id}/pay/{MaNV}', fn($p) => FinesController::pay($p));

// == REPORTS (báo cáo / thống kê) ==
// GET /reports/books-by-category
$router->get('/reports/books-by-category',  fn() => ReportController::booksByCategory());
// GET /reports/currently-borrowed
$router->get('/reports/currently-borrowed', fn() => ReportController::currentlyBorrowed());
// GET /reports/borrow-stats
$router->get('/reports/borrow-stats',       fn() => ReportController::borrowStats());
// GET /reports/overdue-tickets
$router->get('/reports/overdue-tickets',    fn() => ReportController::overdueTickets());

// ── 5. Dispatch ────────────────────────────────────────────
try {
    $router->dispatch($method, $uri);
} catch (Throwable $e) {
    Response::error('Internal Server Error: ' . $e->getMessage(), 500);
}
