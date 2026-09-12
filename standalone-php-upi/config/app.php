<?php
declare(strict_types=1);

// Application Configuration & Bootstrapping
error_reporting(E_ALL);

$isProduction = (getenv('APP_ENV') ?: 'development') === 'production';
ini_set('display_errors', $isProduction ? '0' : '1');
ini_set('log_errors', '1');

// Secure Session Settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_only_cookies', '1');
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

return [
    'name' => 'UPI Payment Gateway Checkout',
    'env' => getenv('APP_ENV') ?: 'production',
    'url' => getenv('APP_URL') ?: 'http://localhost:8000',
    'secret' => getenv('APP_SECRET') ?: 'default_insecure_secret_key_change_me',
];
