<?php
// =========================================================
// modules/auth/AuthController.php
// Tương đương: auth.controller.ts + auth.service.ts (NestJS)
//
// Routes:
//   POST /auth/login  — Đăng nhập, nhận JWT
//   GET  /auth/me     — Xem thông tin user hiện tại
// =========================================================

class AuthController {

    /**
     * POST /auth/login
     * Body: { "MaNV": "...", "password": "..." }
     *
     * Tương đương:
     *   AuthService.login() trong NestJS:
     *   - Tìm tài khoản theo MaNV
     *   - So sánh mật khẩu (bcrypt hoặc plain text tạm thời)
     *   - Tạo JWT token
     */
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true);
        $MaNV     = trim($body['MaNV'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($MaNV) || empty($password)) {
            Response::error('MaNV và password là bắt buộc', 400);
        }

        try {
            $pdo  = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM taikhoan t WHERE t.MaNV = ?');
            $stmt->execute([$MaNV]);
            $user = $stmt->fetch();

            if (!$user) {
                Response::error('Invalid credentials', 401);
            }

            // Hỗ trợ tạm thời: mật khẩu chưa hash (123456) hoặc bcrypt
            $authenticated = false;
            if ($password === $user['MatKhau']) {
                // Plain text (tạm thời như NestJS gốc)
                $authenticated = true;
            } elseif (
                strlen($user['MatKhau']) >= 60 &&
                str_starts_with($user['MatKhau'], '$2')
            ) {
                // BCrypt hash
                $authenticated = password_verify($password, $user['MatKhau']);
            }

            if (!$authenticated) {
                Response::error('wrong password', 401);
            }

            // Tạo JWT payload: { sub: MaNV, role: role }
            $payload = [
                'sub'  => $user['MaNV'],
                'role' => $user['role'],
                'iat'  => time(),
                'exp'  => time() + 86400, // 24h
            ];

            $accessToken = self::generateJWT($payload);
            Response::json(['accessToken' => $accessToken]);

        } catch (PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /auth/me
     * Header: Authorization: Bearer <token>
     *
     * Tương đương: AuthService.getMe() trong NestJS
     */
    public static function getMe(): void {
        $payload = Auth::requireAuth();

        try {
            $pdo  = Database::getConnection();
            // Lấy thông tin user từ DB (không trả MatKhau)
            $stmt = $pdo->prepare(
                'SELECT t.id, t.MaNV, t.role, n.HoTen, n.DienThoai
                 FROM taikhoan t
                 LEFT JOIN nhanvien n ON t.MaNV = n.MaNV
                 WHERE t.MaNV = ?'
            );
            $stmt->execute([$payload['sub']]);
            $user = $stmt->fetch();

            if (!$user) {
                Response::error('User not found', 404);
            }

            Response::json($user);

        } catch (PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
    }

    // ── Private helper: Tạo JWT (HS256) ──────────────────────
    private static function generateJWT(array $payload): string {
        // Lấy secret từ biến môi trường hoặc dùng mặc định
        $secret = getenv('JWT_SECRET') ?: 'your_jwt_secret_key_here';

        $header  = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::base64UrlEncode(json_encode($payload));
        $sig     = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        return "$header.$payload.$sig";
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
