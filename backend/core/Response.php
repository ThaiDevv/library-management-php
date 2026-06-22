<?php
// =========================================================
// core/Response.php — Helper trả về JSON response
// Tương đương: NestJS tự động serialize object → JSON
// =========================================================

class Response {
    /**
     * Trả về JSON response với HTTP status code.
     * @param mixed $data   Dữ liệu cần trả về
     * @param int   $status HTTP status code
     */
    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Trả về lỗi dạng JSON.
     */
    public static function error(string $message, int $status = 400): void {
        self::json(['message' => $message], $status);
    }
}
