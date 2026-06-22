<?php
// =========================================================
// core/Auth.php — Middleware xác thực JWT + phân quyền
// Tương đương: jwt.strategy.ts + roles.guard.ts (NestJS)
// =========================================================

class Auth {
    // Khóa bí mật JWT — phải khớp với secret trong NestJS gốc
    // Thay đổi giá trị này theo biến môi trường JWT_SECRET
    private static string $secret = 'your_jwt_secret_key_here';

    /**
     * Lấy token từ header Authorization: Bearer <token>
     */
    public static function getToken(): ?string {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) {
            return $m[1];
        }
        return null;
    }

    /**
     * Giải mã JWT thủ công (HS256) — không dùng thư viện ngoài.
     * Trả về payload nếu hợp lệ, null nếu không.
     */
    public static function decodeJWT(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$headerB64, $payloadB64, $sigB64] = $parts;

        // Kiểm tra chữ ký
        $signature = self::base64UrlDecode($sigB64);
        $data = $headerB64 . '.' . $payloadB64;
        $expectedSig = hash_hmac('sha256', $data, self::$secret, true);
        if (!hash_equals($expectedSig, $signature)) return null;

        // Giải mã payload
        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        if (!$payload) return null;

        // Kiểm tra hết hạn
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;

        return $payload;
    }

    private static function base64UrlDecode(string $input): string {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $input .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

    /**
     * Bảo vệ route — yêu cầu đăng nhập.
     * Trả về payload của user nếu hợp lệ, ngược lại trả 401.
     */
    public static function requireAuth(): array {
        $token = self::getToken();
        if (!$token) {
            Response::error('Unauthorized: No token provided', 401);
        }
        $payload = self::decodeJWT($token);
        if (!$payload) {
            Response::error('Unauthorized: Invalid or expired token', 401);
        }
        return $payload;
    }

    /**
     * Bảo vệ route — yêu cầu role cụ thể.
     * @param string ...$roles Các role được phép (ADMIN, NHANVIEN)
     */
    public static function requireRole(string ...$roles): array {
        $payload = self::requireAuth();
        if (!in_array($payload['role'] ?? '', $roles, true)) {
            Response::error('Forbidden: Insufficient permissions', 403);
        }
        return $payload;
    }
}
