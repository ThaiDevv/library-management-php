<?php
// =========================================================
// modules/user/ReadersController.php
// Tương đương: readers.controller.ts + user.service.ts
//
// Routes:
//   GET    /readers              — Tìm kiếm độc giả
//   GET    /readers/{id}         — Xem chi tiết độc giả
//   POST   /readers              — Thêm độc giả mới
//   PATCH  /readers/{id}         — Cập nhật thông tin độc giả
//   DELETE /readers/{id}         — Khóa thẻ độc giả
//   POST   /readers/{id}/unlock  — Mở khóa thẻ độc giả
// =========================================================

class ReadersController {

    /**
     * GET /readers?tukhoa=
     * Tương đương: UserService.FindDocGia()
     * SQL: CALL sp_TimKiemDocGia(?)
     */
    public static function findAll(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $tukhoa = $_GET['tukhoa'] ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL sp_TimKiemDocGia(?)');
            $stmt->execute([$tukhoa]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi khi tìm kiếm độc giả: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /readers/{id}
     * Tương đương: UserService.findOneDocGia()
     * SQL: SELECT * FROM docgia WHERE MaDocGia = ?
     */
    public static function findOne(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDocGia = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM docgia WHERE MaDocGia = ?');
            $stmt->execute([$MaDocGia]);
            $data = $stmt->fetch();
            Response::json($data ?: null);
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy độc giả: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /readers
     * Body: { "MaDocGia": "...", "HoTen": "...", "NgaySinh": "...", "DiaChi": "...", "SDT": "..." }
     * Tương đương: UserService.CreateDocGia()
     * SQL: CALL ThemDocGia(?, ?, ?, ?, ?)
     */
    public static function create(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $body     = json_decode(file_get_contents('php://input'), true);
        $MaDocGia = trim($body['MaDocGia'] ?? '');
        $HoTen    = trim($body['HoTen']    ?? '');
        $NgaySinh = $body['NgaySinh'] ?? null;
        $DiaChi   = $body['DiaChi']   ?? null;
        $SDT      = $body['SDT']      ?? null;

        if (empty($MaDocGia) || empty($HoTen)) {
            Response::error('MaDocGia và HoTen là bắt buộc', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThemDocGia(?, ?, ?, ?, ?)');
            $stmt->execute([$MaDocGia, $HoTen, $NgaySinh, $DiaChi, $SDT]);
            Response::json([
                'success' => true,
                'message' => 'Thêm độc giả thành công!',
            ], 201);
        } catch (PDOException $e) {
            Response::error('Lỗi khi thêm độc giả: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /readers/{id}
     * Body: { "HoTen": "...", "NgaySinh": "...", "DiaChi": "...", "SDT": "..." }
     * Tương đương: UserService.UpdateDocGia()
     * SQL: CALL CapNhatDocGia(?, ?, ?, ?, ?)
     */
    public static function update(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDocGia = $params['id'];
        $body     = json_decode(file_get_contents('php://input'), true);
        $HoTen    = $body['HoTen']    ?? null;
        $NgaySinh = $body['NgaySinh'] ?? null;
        $DiaChi   = $body['DiaChi']   ?? null;
        $SDT      = $body['SDT']      ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL CapNhatDocGia(?, ?, ?, ?, ?)');
            $stmt->execute([$MaDocGia, $HoTen, $NgaySinh, $DiaChi, $SDT]);
            Response::json([
                'success' => true,
                'message' => 'Cập nhật độc giả thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi cập nhật độc giả: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /readers/{id}
     * Tương đương: UserService.LockDocGia() — soft delete (khóa thẻ)
     * SQL: UPDATE docgia SET TrangThai = 'Bị Khóa' WHERE MaDocGia = ?
     */
    public static function lock(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDocGia = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE docgia SET TrangThai = 'Bị Khóa' WHERE MaDocGia = ?");
            $stmt->execute([$MaDocGia]);
            Response::json([
                'success' => true,
                'message' => 'Khóa độc giả thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi khóa độc giả: ' . $e->getMessage(), 400);
        }
    }

    /**
     * POST /readers/{id}/unlock
     * Tương đương: UserService.unlockDocGia()
     * SQL: UPDATE docgia SET TrangThai = 'Hoạt Động' WHERE MaDocGia = ?
     */
    public static function unlock(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDocGia = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE docgia SET TrangThai = 'Hoạt Động' WHERE MaDocGia = ?");
            $stmt->execute([$MaDocGia]);
            Response::json([
                'success' => true,
                'message' => 'Mở khóa độc giả thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi mở khóa độc giả: ' . $e->getMessage(), 400);
        }
    }
}
