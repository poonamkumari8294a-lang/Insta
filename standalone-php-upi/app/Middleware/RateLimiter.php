<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

class RateLimiter {
    public static function check(string $action = 'api', int $maxAttempts = 60, int $decayMinutes = 1): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $key = "rl_{$action}_{$ip}";
        $now = time();

        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = ['count' => 1, 'start' => $now];
            return;
        }

        if ($now - $_SESSION[$key]['start'] > ($decayMinutes * 60)) {
            $_SESSION[$key] = ['count' => 1, 'start' => $now];
            return;
        }

        $_SESSION[$key]['count']++;

        if ($_SESSION[$key]['count'] > $maxAttempts) {
            Response::error('Too many requests. Please try again in a minute.', 429);
        }
    }
}
