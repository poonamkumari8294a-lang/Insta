<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';
$paymentConfig = require dirname(__DIR__, 2) . '/config/payment.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Logger.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Models/Payment.php';
require_once dirname(__DIR__, 2) . '/app/Services/PaymentProviderAdapter.php';

use App\Helpers\Response;
use App\Helpers\Logger;
use App\Models\Order;
use App\Models\Payment;
use App\Services\UpiDirectAdapter;

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

$adapter = new UpiDirectAdapter($paymentConfig);

if (!$adapter->verifyWebhook($payload, $signature)) {
    Logger::logEvent(null, 'webhook_signature_failed', ['raw' => $payload], $signature);
    Response::error('Invalid webhook signature', 403);
}

$parsed = $adapter->parseWebhook($payload);
$orderId = $parsed['order_id'];

if (!$orderId) {
    Response::error('Missing order_id in webhook', 400);
}

Logger::logEvent($orderId, 'webhook_received', $parsed, $signature);

if ($parsed['status'] === 'success' || $parsed['status'] === 'paid') {
    Order::updateStatus($orderId, 'paid');
    Payment::create([
        'order_id'            => $orderId,
        'provider'            => 'webhook',
        'transaction_id'      => $parsed['transaction_id'],
        'amount'              => (float)($parsed['amount'] ?? 0),
        'currency'            => 'INR',
        'status'              => 'paid',
        'raw_reference'       => $payload
    ]);
}

Response::success(['message' => 'Webhook handled successfully']);
