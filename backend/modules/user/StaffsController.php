<?php
// =========================================================
// modules/user/StaffsController.php
// Tương đương: staffs.controller.ts + user.service.ts
// Chỉ ADMIN mới được truy cập
//
// Routes:
//   GET    /staffs       — Lấy danh sách nhân viên
//   GET    /staffs/{id}  — Xem chi tiết nhân viên
//   POST   /staffs       — Tạo nhân viên + tài khoản
//   PATCH  /staffs/{id}  — Cập nhật thông tin nhân viên
//   DELETE /staffs/{id}  — Xóa nhân viên
// =========================================================

class StaffsController {

    /**
     * GET /staffs
     * Tương đương: UserService.ViewNhanVien()
     * SQL: SELECT * FROM v_DanhSachNhanVien WHERE 1=1 [+ filters]
     */
    public static function findAll(): void {
        Auth::requireRole('ADMIN');

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->query('SELECT * FROM v_DanhSachNhanVien');
            Response::json($stmt->fetchAll());
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy danh sách nhân viên: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /staffs/{id}
     * Tương đương: UserService.ViewNhanVien({ MaNV: id })
     * SQL: SELECT * FROM v_DanhSachNhanVien WHERE MaNV = ?
     */
    public static function findOne(array $params): void {
        Auth::requireRole('ADMIN');

        $MaNV = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM v_DanhSachNhanVien WHERE `Mã Nhân Viên` = ?');
            $stmt->execute([$MaNV]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy nhân viên: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /staffs
     * Body: { "MaNV": "...", "HoTen": "...", "SDT": "...", "password": "...", "vaitro": "ADMIN|NHANVIEN" }
     * Tương đương: UserService.CreateNewNhanVien()
     * SQL: CALL ThemNhanVien(?, ?, ?) + INSERT taikhoan
     */
    public static function create(): void {
        Auth::requireRole('ADMIN');

        $body     = json_decode(file_get_contents('php://input'), true);
        $MaNV     = trim($body['MaNV']     ?? '');
        $HoTen    = trim($body['HoTen']    ?? '');
        $SDT      = $body['SDT']      ?? null;
        $password = $body['password'] ?? '';
        $vaitro   = $body['vaitro']   ?? 'NHANVIEN';

        if (empty($MaNV) || empty($HoTen) || empty($password)) {
            Response::error('MaNV, HoTen, password là bắt buộc', 400);
        }

        if (!in_array($vaitro, ['ADMIN', 'NHANVIEN'], true)) {
            Response::error('vaitro phải là ADMIN hoặc NHANVIEN', 400);
        }

        try {
            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            // 1. Thêm nhân viên
            $stmt = $pdo->prepare('CALL ThemNhanVien(?, ?, ?)');
            $stmt->execute([$MaNV, $HoTen, $SDT]);

            // 2. Hash mật khẩu + tạo tài khoản
            $hashPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmt2 = $pdo->prepare('INSERT INTO taikhoan (MatKhau, MaNV, role) VALUES (?, ?, ?)');
            $stmt2->execute([$hashPassword, $MaNV, $vaitro]);

            $pdo->commit();
            Response::json([
                'success' => true,
                'message' => 'Thêm nhân viên và tài khoản thành công!',
            ], 201);
        } catch (PDOException $e) {
            $pdo->rollBack();
            Response::error('Lỗi khi tạo nhân viên: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /staffs/{id}
     * Body: { "HoTen": "...", "SDT": "...", "password": "...", "vaitro": "..." }
     * Tương đương: UserService.UpdateNhanVien()
     * SQL: CALL CapNhatNhanVien(?, ?, ?, ?, ?)
     */
    public static function update(array $params): void {
        Auth::requireRole('ADMIN');

        $MaNV     = $params['id'];
        $body     = json_decode(file_get_contents('php://input'), true);
        $HoTen    = $body['HoTen']    ?? null;
        $SDT      = $body['SDT']      ?? null;
        $password = $body['password'] ?? null;
        $vaitro   = $body['vaitro']   ?? null;

        // Hash mật khẩu nếu có
        $hashPassword = null;
        if ($password) {
            $hashPassword = password_hash($password, PASSWORD_BCRYPT);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL CapNhatNhanVien(?, ?, ?, ?, ?)');
            $stmt->execute([$MaNV, $HoTen, $SDT, $hashPassword, $vaitro]);
            Response::json([
                'success' => true,
                'message' => 'Cập nhật nhân viên thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi cập nhật nhân viên: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /staffs/{id}
     * Tương đương: UserService.DeleteNhanVien()
     * SQL: DELETE FROM nhanvien WHERE MaNV = ?
     */
    public static function delete(array $params): void {
        Auth::requireRole('ADMIN');

        $MaNV = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('DELETE FROM nhanvien WHERE MaNV = ?');
            $stmt->execute([$MaNV]);
            Response::json([
                'success' => true,
                'message' => 'Xóa nhân viên thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi xóa nhân viên: ' . $e->getMessage(), 400);
        }
    }
}
