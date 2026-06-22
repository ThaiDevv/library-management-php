<?php
// =========================================================
// modules/fines/FinesController.php
// Tương đương: fines.controller.ts + fines.service.ts
//
// Routes:
//   GET   /fines                    — Danh sách phiếu phạt
//   PATCH /fines/{id}/pay/{MaNV}    — Thanh toán tiền phạt
// =========================================================

class FinesController {

    /**
     * GET /fines?MaDocGia=&MaPM=
     * Tương đương: FinesService.findAll()
     * SQL: SELECT * FROM phieuphat WHERE 1=1 [+ filters]
     */
    public static function findAll(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $MaDocGia = $_GET['MaDocGia'] ?? null;
        $MaPM     = $_GET['MaPM']     ?? null;

        $sql    = 'SELECT * FROM phieuphat WHERE 1=1';
        $params = [];

        if ($MaDocGia) {
            $sql     .= ' AND MaDocGia = ?';
            $params[] = $MaDocGia;
        }
        if ($MaPM) {
            $sql     .= ' AND MaPM = ?';
            $params[] = $MaPM;
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            Response::json($stmt->fetchAll());
        } catch (PDOException $e) {
            Response::error('Lỗi khi lấy phiếu phạt: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PATCH /fines/{id}/pay/{MaNV}
     * Tương đương: FinesService.pay()
     * SQL: CALL sp_ThanhToanTienPhat(?, ?)
     */
    public static function pay(array $params): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $id   = $params['id'];
        $MaNV = $params['MaNV'];

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL sp_ThanhToanTienPhat(?, ?)');
            $stmt->execute([$id, $MaNV]);
            Response::json([
                'success' => true,
                'message' => 'Thanh toán tiền phạt thành công!',
            ]);
        } catch (PDOException $e) {
            Response::error('Lỗi khi thanh toán: ' . $e->getMessage(), 400);
        }
    }
}
