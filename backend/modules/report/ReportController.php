<?php
// =========================================================
// modules/report/ReportController.php
// Tương đương: report.controller.ts + report.service.ts
//
// Routes:
//   GET /reports/books-by-category    — Thống kê sách theo thể loại
//   GET /reports/currently-borrowed   — Thống kê sách đang mượn
//   GET /reports/borrow-stats         — Thống kê mượn trả theo thời gian
//   GET /reports/overdue-tickets      — Báo cáo phiếu quá hạn
// =========================================================

class ReportController {

    /**
     * GET /reports/books-by-category?TenTheLoai=&MaTheLoai=
     * Tương đương: ReportService.ThongKeSachTheoTheLoai()
     * SQL: CALL sp_ThongKeSachTheoTheLoai(?, ?)
     */
    public static function booksByCategory(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $TenTheLoai = $_GET['TenTheLoai'] ?? null;
        $MaTheLoai  = $_GET['MaTheLoai']  ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL sp_ThongKeSachTheoTheLoai(?, ?)');
            $stmt->execute([$TenTheLoai, $MaTheLoai]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi thống kê sách: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /reports/currently-borrowed
     * Tương đương: ReportService.ThongKeSachDangDuocMuon()
     * SQL: CALL sp_ThongKeSachDangMuon()
     */
    public static function currentlyBorrowed(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->query('CALL sp_ThongKeSachDangMuon()');
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi thống kê sách đang mượn: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /reports/borrow-stats?TuNgay=&DenNgay=
     * Tương đương: ReportService.ThongKePhieuMuonTheoThoiGian()
     * SQL: CALL sp_ThongKePhieuMuonTheoThoiGian(?, ?)
     */
    public static function borrowStats(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        $TuNgay  = $_GET['TuNgay']  ?? null;
        $DenNgay = $_GET['DenNgay'] ?? null;

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('CALL sp_ThongKePhieuMuonTheoThoiGian(?, ?)');
            $stmt->execute([$TuNgay, $DenNgay]);
            $data = $stmt->fetchAll();
            Response::json($data);
        } catch (PDOException $e) {
            Response::error('Lỗi thống kê phiếu mượn: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /reports/overdue-tickets
     * Tương đương: ReportService.overdueTickets()
     * SQL: SELECT * FROM quanlyphieuquahan
     */
    public static function overdueTickets(): void {
        Auth::requireRole('ADMIN', 'NHANVIEN');

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->query('SELECT * FROM quanlyphieuquahan');
            Response::json($stmt->fetchAll());
        } catch (PDOException $e) {
            Response::error('Lỗi lấy phiếu quá hạn: ' . $e->getMessage(), 500);
        }
    }
}
