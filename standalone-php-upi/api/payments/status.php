<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Validator.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Models/Payment.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Models\Order;
use App\Models\Payment;

$orderId = Validator::sanitizeString($_GET['order'] ?? $_GET['order_id'] ?? '');

if (empty($orderId)) {
    Response::error('Order ID is required', 400);
}

$order = Order::findByOrderId($orderId);
if (!$order) {
    Response::error('Order not found', 404);
}

// Check expiration if still pending
if ($order['status'] === 'pending' && strtotime($order['expires_at']) < time()) {
    Order::updateStatus($orderId, 'expired');
    $order['status'] = 'expired';
}

$payment = Payment::findByOrderId($orderId);

Response::success([
    'order_id'       => $order['order_id'],
    'status'         => $order['status'],
    'amount'         => (float)$order['amount'],
    'currency'       => $order['currency'],
    'product_name'   => $order['product_name'],
    'transaction_id' => $payment['transaction_id'] ?? null,
    'expires_at'     => $order['expires_at']
]);
