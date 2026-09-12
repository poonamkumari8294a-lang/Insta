<?php
declare(strict_types=1);

namespace App\Helpers;

class Validator {
    public static function sanitizeString(?string $val): string {
        if ($val === null) return '';
        return trim(htmlspecialchars(strip_tags($val), ENT_QUOTES, 'UTF-8'));
    }

    public static function isValidOrderId(string $orderId): bool {
        return (bool)preg_match('/^VVV-[A-F0-9]{12}$/', $orderId);
    }

    public static function isValidUtr(string $utr): bool {
        return (bool)preg_match('/^[A-Za-z0-9]{8,24}$/', trim($utr));
    }

    public static function isValidEmail(string $email): bool {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function isValidPhone(string $phone): bool {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        return strlen($clean) >= 10 && strlen($clean) <= 12;
    }
}
