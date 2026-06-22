<?php
// =========================================================
// modules/book/BookController.php
// Tương đương: book.controller.ts + book.service.ts (NestJS)
//
// Routes:
//   GET    /books                   — Tìm kiếm / lấy danh sách đầu sách
//   GET    /books/{id}              — Xem chi tiết 1 đầu sách
//   POST   /books                   — Thêm đầu sách mới
//   PATCH  /books/{id}              — Cập nhật đầu sách
//   DELETE /books/{id}              — Xóa đầu sách
//   GET    /books/{id}/instances    — Lấy danh sách cuốn sách vật lý
//   POST   /books/{id}/instances    — Nhập kho (thêm cuốn sách vật lý)
// =========================================================

class BookController {

    /**
     * GET /books?TenSach=&TacGia=&MaTheLoai=
     * Tương đương: BookService.findOne(searchDto)
     * SQL: CALL TimKiemDauSach(?, ?, ?)
     */
    public static function findAll(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $TenSach   = $_GET['TenSach']   ?? null;
        $TacGia    = $_GET['TacGia']    ?? null;
        $MaTheLoai = $_GET['MaTheLoai'] ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL TimKiemDauSach(?, ?, ?)');
            $stmt->execute([$TenSach, $TacGia, $MaTheLoai]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi khi tìm kiếm đầu sách: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /books/{id}
     * Tương đương: BookService.findOneBook(MaDauSach)
     * SQL: SELECT * FROM v_quanlysach WHERE MaDauSach = ?
     */
    public static function findOne(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDauSach = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM v_quanlysach WHERE MaDauSach = ?');
            $stmt->execute([$MaDauSach]);
            $data = $stmt->fetch();
            Response::json($data ?: null);
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy đầu sách: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /books
     * Body: { "MaDauSach": "...", "TenSach": "...", "MaTheLoai": "...", "TacGia": "...", "NamXB": ... }
     * Tương đương: BookService.create()
     * SQL: CALL ThemDauSach(?, ?, ?, ?, ?)
     */
    public static function create(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $body      = json_decode(file_get_contents('php://input'), true);
        $MaDauSach  = trim($body['MaDauSach']  ?? '');
        $TenSach    = trim($body['TenSach']    ?? '');
        $MaTheLoai  = trim($body['MaTheLoai']  ?? '');
        $TacGia     = $body['TacGia']    ?? null;
        $NamXB      = $body['NamXB']     ?? null;

        if (empty($MaDauSach) || empty($TenSach) || empty($MaTheLoai)) {
            Response::error('MaDauSach, TenSach, MaTheLoai là bắt buộc', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThemDauSach(?, ?, ?, ?, ?)');
            $stmt->execute([$MaDauSach, $TenSach, $MaTheLoai, $TacGia, $NamXB]);
            Response::json([
                'success' => true,
                'message' => 'Thêm đầu sách thành công!',
            ], 201);
        } catch (PDOException $e) {
            Response::error('Lỗi khi thêm đầu sách: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /books/{id}
     * Body: { "TenSach": "...", "MaTheLoai": "...", "TacGia": "...", "NamXB": ... }
     * Tương đương: BookService.update()
     * SQL: CALL CapNhatDauSach(?, ?, ?, ?, ?)
     */
    public static function update(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDauSach = $params['id'];
        $body      = json_decode(file_get_contents('php://input'), true);
        $TenSach   = $body['TenSach']   ?? null;
        $MaTheLoai = $body['MaTheLoai'] ?? null;
        $TacGia    = $body['TacGia']    ?? null;
        $NamXB     = $body['NamXB']     ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL CapNhatDauSach(?, ?, ?, ?, ?)');
            $stmt->execute([$MaDauSach, $TenSach, $MaTheLoai, $TacGia, $NamXB]);
            Response::json([
                'success' => true,
                'message' => 'Cập nhật đầu sách thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi cập nhật đầu sách: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /books/{id}
     * Tương đương: BookService.remove()
     * Xóa theo thứ tự: ct_phieumuon → cuonsach → dausach
     */
    public static function delete(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDauSach = $params['id'];

        try {
            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            // 1. Xóa chi tiết phiếu mượn liên quan
            $pdo->prepare(
                'DELETE FROM ct_phieumuon WHERE MaCuonSach IN
                 (SELECT MaCuonSach FROM cuonsach WHERE MaDauSach = ?)'
            )->execute([$MaDauSach]);

            // 2. Xóa các cuốn sách vật lý
            $pdo->prepare('DELETE FROM cuonsach WHERE MaDauSach = ?')
                ->execute([$MaDauSach]);

            // 3. Xóa đầu sách
            $pdo->prepare('DELETE FROM dausach WHERE MaDauSach = ?')
                ->execute([$MaDauSach]);

            $pdo->commit();
            Response::json([
                'success' => true,
                'message' => 'Xóa đầu sách thành công!',
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            Response::error('Lỗi khi xóa đầu sách: ' . $e->getMessage(), 400);
        }
    }

    /**
     * GET /books/{id}/instances
     * Tương đương: BookService.findInstances()
     * SQL: SELECT * FROM cuonsach WHERE MaDauSach = ?
     */
    public static function findInstances(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDauSach = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM cuonsach WHERE MaDauSach = ?');
            $stmt->execute([$MaDauSach]);
            Response::json($stmt->fetchAll());
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy cuốn sách: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /books/{id}/instances
     * Body: { "SoLuong": 3 }
     * Tương đương: BookService.addInstance()
     * SQL: CALL NhapKhoCuonSach(?, ?)
     */
    public static function addInstance(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDauSach = $params['id'];
        $body      = json_decode(file_get_contents('php://input'), true);
        $SoLuong   = (int) ($body['SoLuong'] ?? 0);

        if ($SoLuong <= 0) {
            Response::error('SoLuong phải lớn hơn 0', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL NhapKhoCuonSach(?, ?)');
            $stmt->execute([$MaDauSach, $SoLuong]);
            Response::json([
                'success' => true,
                'message' => 'Thêm cuốn sách thành công!',
            ], 201);
        } catch (PDOException $e) {
            Response::error('Lỗi khi nhập kho: ' . $e->getMessage(), 400);
        }
    }
}
