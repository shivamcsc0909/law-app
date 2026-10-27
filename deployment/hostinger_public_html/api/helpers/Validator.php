<?php

class Validator {
    public static function sanitize(string $data): string {
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    public static function validateIndianPhone(string $phone): bool {
        // Matches +91XXXXXXXXXX or 10-digit Indian mobile numbers
        return (bool) preg_match('/^(?:\+91|91)?[6-9]\d{9}$/', trim($phone));
    }

    public static function normalizeIndianPhone(string $phone): string {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 10) {
            return '+91' . $digits;
        } elseif (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return '+' . $digits;
        }
        return '+' . $digits;
    }

    public static function validateEmail(string $email): bool {
        return (bool) filter_var(trim($email), FILTER_VALIDATE_EMAIL);
    }

    public static function getJsonBody(): array {
        $input = file_get_contents('php://input');
        if (empty($input)) return [];
        $data = json_decode($input, true);
        return is_array($data) ? $data : [];
    }
}
