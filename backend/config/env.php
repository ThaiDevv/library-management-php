<?php
// =========================================================
// .env.example — Biến môi trường mẫu
// Sao chép thành .env và chỉnh sửa theo môi trường thực tế
// =========================================================

// Cấu hình Database
define('DB_HOST',     getenv('DB_HOST')     ?: 'localhost');
define('DB_NAME',     getenv('DB_NAME')     ?: 'railway');
define('DB_USER',     getenv('DB_USER')     ?: 'root');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');
define('DB_CHARSET',  getenv('DB_CHARSET')  ?: 'utf8mb4');

// JWT Secret (phải khớp với NestJS nếu dùng chung token)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your_jwt_secret_key_here');

// Cổng server (chỉ dùng khi chạy PHP built-in server)
define('SERVER_PORT', getenv('PORT') ?: '3000');
