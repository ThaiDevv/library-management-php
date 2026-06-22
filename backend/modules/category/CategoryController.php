<?php
// =========================================================
// modules/category/CategoryController.php
// Tương đương: category.controller.ts + category.service.ts
//
// Routes:
//   GET    /categories       — Lấy tất cả thể loại
//   POST   /categories       — Thêm thể loại mới
//   PATCH  /categories/{id}  — Cập nhật thể loại
//   DELETE /categories/{id}  — Xóa thể loại
// =========================================================

class CategoryController {

    /**
     * GET /categories
     * Tương đương: CategoryService.getAllcategory()
     * SQL: SELECT * FROM theloai
     */
    public static function getAll(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->query('SELECT * FROM theloai');
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy danh sách thể loại: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /categories
     * Body: { "MaTheLoai": "...", "TenTheLoai": "...", "MoTa": "..." }
     * Tương đương: CategoryService.addCategoryService()
     * SQL: CALL ThemTheLoai(?, ?, ?)
     */
    public static function create(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $body      = json_decode(file_get_contents('php://input'), true);
        $MaTheLoai  = trim($body['MaTheLoai'] ?? '');
        $TenTheLoai = trim($body['TenTheLoai'] ?? '');
        $MoTa       = $body['MoTa'] ?? null;

        if (empty($MaTheLoai) || empty($TenTheLoai)) {
            Response::error('MaTheLoai và TenTheLoai là bắt buộc', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL ThemTheLoai(?, ?, ?)');
            $stmt->execute([$MaTheLoai, $TenTheLoai, $MoTa]);
            Response::json([
                'success' => true,
                'message' => 'Thêm thể loại thành công!',
            ], 201);
        } catch (PDOException $e) {
            Response::error('Lỗi từ Database: ' . $e->getMessage(), 400);
        }
    }

    /**
     * PATCH /categories/{id}
     * Body: { "TenTheLoai": "...", "MoTa": "..." }
     * Tương đương: CategoryService.updateCategory()
     * SQL: CALL CapNhatTheLoai(?, ?, ?)
     */
    public static function update(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaTheLoai  = $params['id'];
        $body       = json_decode(file_get_contents('php://input'), true);
        $TenTheLoai = $body['TenTheLoai'] ?? null;
        $MoTa       = $body['MoTa'] ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL CapNhatTheLoai(?, ?, ?)');
            $stmt->execute([$MaTheLoai, $TenTheLoai, $MoTa]);
            Response::json([
                'success' => true,
                'message' => 'Cập nhật thể loại thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi cập nhật thể loại: ' . $e->getMessage(), 400);
        }
    }

    /**
     * DELETE /categories/{id}
     * Tương đương: CategoryService.deleteCategory()
     * SQL: CALL XoaTheLoai(?)
     */
    public static function delete(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaTheLoai = $params['id'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL XoaTheLoai(?)');
            $stmt->execute([$MaTheLoai]);
            Response::json([
                'success' => true,
                'message' => 'Xóa thể loại thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi xóa thể loại: ' . $e->getMessage(), 400);
        }
    }
}
