<?php
// =========================================================
// core/Router.php — Bộ định tuyến HTTP đơn giản
// Xử lý routing tương tự @Controller trong NestJS
// =========================================================

class Router {
    private array $routes = [];

    /**
     * Đăng ký route
     * @param string   $method   Phương thức HTTP (GET, POST, PATCH, DELETE)
     * @param string   $pattern  Pattern URL (hỗ trợ {param})
     * @param callable $handler  Hàm xử lý
     */
    public function add(string $method, string $pattern, callable $handler): void {
        // Chuyển {param} → named capture group (?P<param>[^/]+)
        $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#u';
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => $regex,
            'handler' => $handler,
        ];
    }

    public function get(string $pattern, callable $handler): void {
        $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): void {
        $this->add('POST', $pattern, $handler);
    }

    public function patch(string $pattern, callable $handler): void {
        $this->add('PATCH', $pattern, $handler);
    }

    public function delete(string $pattern, callable $handler): void {
        $this->add('DELETE', $pattern, $handler);
    }

    /**
     * Phân giải và chạy route phù hợp.
     */
    public function dispatch(string $method, string $uri): void {
        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method)) {
                continue;
            }
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Lọc chỉ lấy named params
                $params = array_filter(
                    $matches,
                    fn($k) => !is_int($k),
                    ARRAY_FILTER_USE_KEY
                );
                call_user_func($route['handler'], $params);
                return;
            }
        }
        // Không tìm thấy route
        Response::json(['message' => 'Route not found'], 404);
    }
}
