<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

class AuthMiddleware {
    public static function requireAdmin(): array {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['admin_user']) || empty($_SESSION['admin_user']['id'])) {
            if (self::isApiRequest()) {
                Response::error('Unauthorized: Admin login required', 401);
            } else {
                header('Location: /admin/login.php');
                exit;
            }
        }

        return $_SESSION['admin_user'];
    }

    private static function isApiRequest(): bool {
        return (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json')) ||
               (isset($_SERVER['REQUEST_URI']) && str_contains($_SERVER['REQUEST_URI'], '/api/'));
    }
}
