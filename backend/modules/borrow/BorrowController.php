<?php
// =========================================================
// modules/borrow/BorrowController.php
// Tương đương: borrow.controller.ts + borrow.service.ts
//
// Routes:
//   GET    /borrow-tickets               — Tìm kiếm phiếu mượn
//   GET    /borrow-tickets/{id}          — Xem chi tiết phiếu mượn
//   POST   /borrow-tickets               — Tạo phiếu mượn mới
//   DELETE /borrow-tickets/{id}          — Xóa phiếu mượn
//   PATCH  /borrow-tickets/{id}/deadline — Gia hạn sách
//   POST   /borrow-tickets/{id}/books    — Thêm sách vào phiếu
//   DELETE /borrow-tickets/{id}/books    — Trả sách (từng cuốn)
//   POST   /borrow-tickets/{id}/return   — Trả tất cả sách
// =========================================================

class BorrowController {

    /**
     * GET /borrow-tickets?TenDocGia=&TuNgay=&DenNgay=
     * Tương đương: BorrowService.findAll()
     * SQL: CALL TimKiemMuonSach(?, ?, ?)
     */
    public static function findAll(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $TenDocGia = $_GET['TenDocGia'] ?? null;
        $TuNgay    = $_GET['TuNgay']    ?? null;
        $DenNgay   = $_GET['DenNgay']   ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL TimKiemMuonSach(?, ?, ?)');
            $stmt->execute([
                $TenDocGia ?: null,
                $TuNgay    ?: null,
                $DenNgay   ?: null,
            ]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi khi tìm kiếm phiếu mượn: ' . $e->getMessage(), 400);
        }
    }

    /**
     * GET /borrow-tickets/{id}
     * Tương đương: BorrowService.findOne()
     * SQL: SELECT * FROM v_phieumuonchitiet WHERE MaPM = ?
     */
    public static function findOne(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM v_phieumuonchitiet WHERE MaPM = ?');
            $stmt->execute([$MaPM]);
            $data = $stmt->fetch();
            Response::json($data ?: null);
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy phiếu mượn: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /borrow-tickets
     * Body: { "MaDocGia": "...", "MaNV": "...", "NgayTraDuKien": "...", "DanhSach": [...] }
     * Tương đương: BorrowService.creatBorrow() / demoBorrow()
     * SQL: CALL ThucHienMuonNhieuSach(?, ?, ?, ?)
     */
    public static function create(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $body          = json_decode(file_get_contents('php://input'), true);
        $MaDocGia      = trim($body['MaDocGia']      ?? '');
        $MaNV          = trim($body['MaNV']          ?? '');
        $NgayTraDuKien = trim($body['NgayTraDuKien'] ?? '');
        $DanhSach      = $body['DanhSach']            ?? [];

        if (empty($MaDocGia) || empty($MaNV) || empty($NgayTraDuKien) || empty($DanhSach)) {
            Response::error('MaDocGia, MaNV, NgayTraDuKien, DanhSach là bắt buộc', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThucHienMuonNhieuSach(?, ?, ?, ?)');
            $stmt->execute([
                $MaDocGia,
                $MaNV,
                $NgayTraDuKien,
                json_encode($DanhSach),
            ]);
            Response::json([
                'success' => true,
                'message' => 'Thêm phiếu mượn thành công!',
            ], 201);
        } catch (PDOException $e) {
            Response::error('Lỗi khi thêm phiếu mượn: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /borrow-tickets/{id}
     * Tương đương: BorrowService.deleteBorrow()
     * SQL: DELETE FROM phieumuon WHERE MaPM = ?
     */
    public static function delete(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('DELETE FROM phieumuon WHERE MaPM = ?');
            $stmt->execute([$MaPM]);
            Response::json([
                'success' => true,
                'message' => 'Xóa phiếu mượn thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi xóa phiếu mượn: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /borrow-tickets/{id}/deadline
     * Body: { "SoNgayThem": 7 }
     * Tương đương: BorrowService.updateDeadline()
     * SQL: CALL GiaHanSach(?, ?)
     */
    public static function extendDeadline(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM  = $params['id'];
        $body  = json_decode(file_get_contents('php://input'), true);
        $SoNgayThem = (int) ($body['SoNgayThem'] ?? 0);

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL GiaHanSach(?, ?)');
            $stmt->execute([$MaPM, $SoNgayThem]);
            Response::json([
                'success' => true,
                'message' => 'Cập nhật phiếu mượn thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi cập nhật phiếu mượn: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /borrow-tickets/{id}/books
     * Body: { "DanhSach": [...] }
     * Tương đương: BorrowService.addBookinBorrow()
     * SQL: CALL ThemSachVaoPhieuMuon(?, ?)
     */
    public static function addBook(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM     = $params['id'];
        $body     = json_decode(file_get_contents('php://input'), true);
        $DanhSach = $body['DanhSach'] ?? [];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThemSachVaoPhieuMuon(?, ?)');
            $stmt->execute([$MaPM, json_encode($DanhSach)]);
            Response::json([
                'success' => true,
                'message' => 'Thêm sách vào phiếu mượn thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi thêm sách: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /borrow-tickets/{id}/books
     * Body: { "DanhSach": [...] }
     * Tương đương: BorrowService.deleteBookInBorrow()
     * SQL: CALL ThucHienTraSach(?, ?)
     */
    public static function removeBook(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM     = $params['id'];
        $body     = json_decode(file_get_contents('php://input'), true);
        $DanhSach = $body['DanhSach'] ?? [];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThucHienTraSach(?, ?)');
            $stmt->execute([$MaPM, json_encode($DanhSach)]);
            Response::json([
                'success' => true,
                'message' => 'Trả sách thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi trả sách: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /borrow-tickets/{id}/return
     * Tương đương: BorrowService.returnBooks()
     * SQL: CALL TraNhieuSach(?)
     */
    public static function returnAll(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaPM = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL TraNhieuSach(?)');
            $stmt->execute([$MaPM]);
            Response::json([
                'success' => true,
                'message' => 'Trả sách thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi trả sách: ' . $e->getMessage(), 400);
        }
    }
}
