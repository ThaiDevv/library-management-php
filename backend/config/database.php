<?php
// =========================================================
// config/database.php — Kết nối CSDL MySQL
// Tương đương: src/database/database.service.ts (NestJS)
// =========================================================

class Database {
    private static ?PDO $instance = null;

    // Cấu hình kết nối — chỉnh sửa theo môi trường của bạn
    // Hoặc đặt biến môi trường: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
    private static string $host     = '';
    private static string $dbname   = '';
    private static string $username = '';
    private static string $password = '';
    private static string $charset  = 'utf8mb4';

    private static function config(): void {
        self::$host     = getenv('DB_HOST')     ?: 'localhost';
        self::$dbname   = getenv('DB_NAME')     ?: 'railway';
        self::$username = getenv('DB_USER')     ?: 'root';
        self::$password = getenv('DB_PASSWORD') ?: '';
    }

    public static function getConnection(): PDO {
        if (self::$host === '') self::config();
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                self::$host,
                self::$dbname,
                self::$charset
            );
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            self::$instance = new PDO($dsn, self::$username, self::$password, $options);
        }
        return self::$instance;
    }

    /**
     * Thực hiện truy vấn SQL có tham số (prepared statement).
     * @param string $sql   Câu lệnh SQL
     * @param array  $params Mảng tham số
     * @return array        Kết quả truy vấn
     */
    public static function query(string $sql, array $params = []): array {
        $pdo  = self::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Nếu là SELECT / CALL trả về kết quả
        $results = [];
        do {
            $rows = $stmt->fetchAll();
            if ($rows !== false && count($rows) > 0) {
                $results[] = $rows;
            }
        } while ($stmt->nextRowset());

        return $results;
    }

    /**
     * Thực hiện truy vấn không trả về dữ liệu (INSERT/UPDATE/DELETE).
     */
    public static function execute(string $sql, array $params = []): int {
        $pdo  = self::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}
