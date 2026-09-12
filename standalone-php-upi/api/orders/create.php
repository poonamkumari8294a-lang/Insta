<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/config/app.php';
$paymentConfig = require dirname(__DIR__, 2) . '/config/payment.php';

require_once dirname(__DIR__, 2) . '/app/Helpers/Response.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Validator.php';
require_once dirname(__DIR__, 2) . '/app/Helpers/Logger.php';
require_once dirname(__DIR__, 2) . '/app/Middleware/RateLimiter.php';
require_once dirname(__DIR__, 2) . '/app/Models/Order.php';
require_once dirname(__DIR__, 2) . '/app/Models/Payment.php';
require_once dirname(__DIR__, 2) . '/app/Services/UpiService.php';
require_once dirname(__DIR__, 2) . '/app/Services/QrService.php';
require_once dirname(__DIR__, 2) . '/app/Services/PaymentProviderAdapter.php';
require_once dirname(__DIR__, 2) . '/app/Services/PaymentService.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\RateLimiter;
use App\Services\PaymentService;

RateLimiter::check('order_create', 20, 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$productId = (int)($input['product_id'] ?? 1);
$amount = (float)($input['amount'] ?? 149.00);
$productName = Validator::sanitizeString($input['product_name'] ?? 'VIP Exclusive Access Pack');
$customerName = Validator::sanitizeString($input['name'] ?? '');
$customerEmail = Validator::sanitizeString($input['email'] ?? '');
$customerPhone = Validator::sanitizeString($input['phone'] ?? '');

if ($amount <= 0) {
    Response::error('Invalid order amount', 400);
}

try {
    $service = new PaymentService($paymentConfig);
    $result = $service->initializePayment([
        'name'  => $customerName,
        'email' => $customerEmail,
        'phone' => $customerPhone
    ], $amount, $productId, $productName);

    Response::success($result);
} catch (\Throwable $e) {
    Response::error($e->getMessage(), 500);
}
