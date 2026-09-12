<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Validator.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Logger.php';
require_once dirname(__DIR__, 2) . '/app/Middleware/AuthMiddleware.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Models/PaymentProof.php';
require_once dirname(__DIR__, 2) . '/app/Models/ManualReview.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Helpers\Logger;
use App\Middleware\AuthMiddleware;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\ManualReview;

$admin = AuthMiddleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$orderId = Validator::sanitizeString($input['order_id'] ?? '');
$reason = Validator::sanitizeString($input['reason'] ?? 'Payment proof rejected by admin');

if (!Validator::isValidOrderId($orderId)) {
    Response::error('Invalid order ID', 400);
}

$order = Order::findByOrderId($orderId);
if (!$order) {
    Response::error('Order not found', 404);
}

Order::updateStatus($orderId, 'failed');

$proof = PaymentProof::findByOrderId($orderId);
if ($proof) {
    PaymentProof::updateStatus((int)$proof['id'], 'rejected');
}

ManualReview::process($orderId, 'rejected', (int)$admin['id'], $reason);

Logger::logAdminAction((int)$admin['id'], 'reject_payment', 'order', $orderId, "Rejected: {$reason}");

Response::success([
    'order_id' => $orderId,
    'status'   => 'failed',
    'message'  => 'Order marked as failed/rejected'
]);
