<?php
declare(strict_types=1);

return [
    'upi_vpa' => getenv('UPI_VPA') ?: 'payee@upi',
    'merchant_name' => getenv('MERCHANT_NAME') ?: 'Exclusive Content Hub',
    'timeout_minutes' => (int)(getenv('PAYMENT_TIMEOUT_MINUTES') ?: 30),
    'webhook_secret' => getenv('WEBHOOK_SECRET') ?: 'whsec_test_secret_key',
    'provider' => getenv('PROVIDER_ADAPTER') ?: 'upi_direct',
    'max_upload_bytes' => 5 * 1024 * 1024, // 5 MB
    'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
    'storage_dir' => dirname(__DIR__) . '/storage/uploads',
];
