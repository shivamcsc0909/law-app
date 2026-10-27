<?php
require_once __DIR__ . '/../services/JWTService.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthMiddleware {
    public static function authenticate(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::unauthorized('Authentication token missing or malformed');
            return null;
        }

        $token = $matches[1];
        $payload = JWTService::verifyToken($token);

        if (!$payload) {
            Response::unauthorized('Session has expired or token is invalid. Please log in again.');
            return null;
        }

        return $payload;
    }

    public static function optionalAuth(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return JWTService::verifyToken($matches[1]);
        }
        return null;
    }

    public static function requireRole(array $allowedRoles): array {
        $user = self::authenticate();
        if (!in_array($user['role'] ?? '', $allowedRoles)) {
            Response::forbidden('You do not have permission to access this resource.');
        }
        return $user;
    }
}
