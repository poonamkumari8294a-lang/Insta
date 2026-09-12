<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';
$paymentConfig = require dirname(__DIR__, 2) . '/config/payment.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Validator.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Logger.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Services/UpiService.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Helpers\Logger;
use App\Models\Order;
use App\Services\UpiService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$orderId = Validator::sanitizeString($input['order_id'] ?? '');
$appName = Validator::sanitizeString($input['app'] ?? 'phonepe');

if (!Validator::isValidOrderId($orderId)) {
    Response::error('Invalid order ID format', 400);
}

$order = Order::findByOrderId($orderId);
if (!$order) {
    Response::error('Order not found', 404);
}

// Log intent attempt
Logger::logEvent($orderId, 'intent_launched', ['app' => $appName]);

$urls = UpiService::buildPayload(
    $paymentConfig['upi_vpa'],
    $paymentConfig['merchant_name'],
    (float)$order['amount'],
    $order['order_id'],
    "Order {$order['order_id']}"
);

$targetUrl = match ($appName) {
    'phonepe' => $urls['phonepe'],
    'paytm'   => $urls['paytm'],
    'gpay'    => $urls['gpay'],
    'bhim'    => $urls['bhim'],
    default   => $urls['generic']
};

Response::success([
    'order_id'   => $orderId,
    'app'        => $appName,
    'intent_url' => $targetUrl,
    'fallback'   => $urls['generic']
]);
