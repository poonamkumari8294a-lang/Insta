<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

class CsrfMiddleware {
    public static function generateToken(): string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function validate(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $submitted = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            $stored = $_SESSION['csrf_token'] ?? '';

            if (empty($stored) || empty($submitted) || !hash_equals($stored, $submitted)) {
                Response::error('Invalid or expired CSRF token', 403);
            }
        }
    }
}
