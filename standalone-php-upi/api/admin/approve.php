<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Validator.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Logger.php';
require_once dirname(__DIR__, 2) . '/app/Middleware/AuthMiddleware.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Models/Payment.php';
require_once dirname(__DIR__, 2) . '/app/Models/PaymentProof.php';
require_once dirname(__DIR__, 2) . '/app/Models/ManualReview.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Helpers\Logger;
use App\Middleware\AuthMiddleware;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentProof;
use App\Models\ManualReview;

$admin = AuthMiddleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$orderId = Validator::sanitizeString($input['order_id'] ?? '');
$txnRef = Validator::sanitizeString($input['transaction_ref'] ?? 'ADMIN_MANUAL_APPROVAL');

if (!Validator::isValidOrderId($orderId)) {
    Response::error('Invalid order ID', 400);
}

$order = Order::findByOrderId($orderId);
if (!$order) {
    Response::error('Order not found', 404);
}

// 1. Mark Order as PAID
Order::updateStatus($orderId, 'paid');

// 2. Mark Proof as approved
$proof = PaymentProof::findByOrderId($orderId);
if ($proof) {
    PaymentProof::updateStatus((int)$proof['id'], 'approved');
}

// 3. Mark Review record
ManualReview::process($orderId, 'approved', (int)$admin['id'], "Approved by {$admin['username']}");

// 4. Create or update payment
Payment::create([
    'order_id'       => $orderId,
    'provider'       => 'admin_manual_review',
    'transaction_id' => $txnRef,
    'amount'         => (float)$order['amount'],
    'currency'       => 'INR',
    'status'         => 'paid'
]);

Logger::logAdminAction((int)$admin['id'], 'approve_payment', 'order', $orderId, "Approved payment for {$orderId}");

Response::success([
    'order_id' => $orderId,
    'status'   => 'paid',
    'message'  => 'Order verified and approved successfully'
]);
