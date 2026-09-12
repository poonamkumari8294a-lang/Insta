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
require_once dirname(__DIR__, 2) . '/app/Models/PaymentProof.php';
require_once dirname(__DIR__, 2) . '/app/Models/ManualReview.php';
require_once dirname(__DIR__, 2) . '/app/Services/PaymentProviderAdapter.php';
require_once dirname(__DIR__, 2) . '/app/Services/PaymentService.php';

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\RateLimiter;
use App\Services\PaymentService;

RateLimiter::check('proof_upload', 10, 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', 405);
}

$orderId = Validator::sanitizeString($_POST['order_id'] ?? '');
$utr = Validator::sanitizeString($_POST['utr'] ?? '');

if (!Validator::isValidOrderId($orderId)) {
    Response::error('Invalid order ID format', 400);
}

if (!isset($_FILES['screenshot']) || empty($_FILES['screenshot']['name'])) {
    Response::error('Screenshot file is required', 400);
}

try {
    $service = new PaymentService($paymentConfig);
    $result = $service->processScreenshotProof($orderId, $_FILES['screenshot'], $utr);

    Response::success($result);
} catch (\Throwable $e) {
    Response::error($e->getMessage(), 400);
}
