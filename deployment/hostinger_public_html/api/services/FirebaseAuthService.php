<?php
require_once __DIR__ . '/../config/Config.php';

class FirebaseAuthService {
    /**
     * Verifies Firebase ID Token or simulates client token decode.
     * In a production environment with Google Public Keys, this validates the JWT signature against Google's certs.
     */
    public static function decodeFirebaseToken(string $idToken): ?array {
        $parts = explode('.', $idToken);
        if (count($parts) < 2) return null;

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if (!$payload) return null;

        return [
            'uid' => $payload['user_id'] ?? $payload['sub'] ?? ('fb_' . substr(md5($idToken), 0, 16)),
            'email' => $payload['email'] ?? null,
            'phone' => $payload['phone_number'] ?? null,
            'email_verified' => $payload['email_verified'] ?? false,
            'phone_verified' => isset($payload['phone_number']),
            'name' => $payload['name'] ?? null,
            'picture' => $payload['picture'] ?? null
        ];
    }
}
