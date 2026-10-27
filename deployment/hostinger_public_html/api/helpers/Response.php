<?php

class Response {
    public static function json(bool $success, string $message, mixed $data = null, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(string $message = 'Success', mixed $data = null, int $statusCode = 200): void {
        self::json(true, $message, $data, $statusCode);
    }

    public static function error(string $message = 'An error occurred', mixed $data = null, int $statusCode = 400): void {
        self::json(false, $message, $data, $statusCode);
    }

    public static function unauthorized(string $message = 'Unauthorized access'): void {
        self::json(false, $message, null, 401);
    }

    public static function forbidden(string $message = 'Access forbidden'): void {
        self::json(false, $message, null, 403);
    }

    public static function notFound(string $message = 'Resource not found'): void {
        self::json(false, $message, null, 404);
    }
}
