<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';
$paymentConfig = require dirname(__DIR__) . '/config/payment.php';

require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Models/Payment.php';
require_once dirname(__DIR__) . '/app/Services/UpiService.php';
require_once dirname(__DIR__) . '/app/Services/QrService.php';
require_once dirname(__DIR__) . '/app/Services/PaymentProviderAdapter.php';
require_once dirname(__DIR__) . '/app/Services/PaymentService.php';

use App\Models\Order;
use App\Services\PaymentService;

$orderId = $_GET['order'] ?? null;
$amount = 149.00;

if (!$orderId) {
    // Create new order on the fly if not provided
    $service = new PaymentService($paymentConfig);
    $res = $service->initializePayment([
        'name' => 'VIP Customer'
    ], $amount, 1, 'VIP Exclusive Access Pack');
    $orderId = $res['order_id'];
    header("Location: /public/checkout.php?order={$orderId}");
    exit;
}

$order = Order::findByOrderId($orderId);
if (!$order) {
    die("Order not found");
}

$amount = (float)$order['amount'];
$amountFormatted = '₹' . number_format($amount, 0);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pay <?php echo $amountFormatted; ?> with UPI</title>
  <link rel="stylesheet" href="/public/assets/style.css">
</head>
<body>
  <div class="checkout-container">
    <div class="checkout-header">
      <h1>Pay <?php echo $amountFormatted; ?> with UPI</h1>
      <p>Select an app to pay <?php echo $amountFormatted; ?> securely.</p>
    </div>

    <div class="checkout-body">
      <div class="section-label">UPI APPS</div>

      <div class="app-list">
        <!-- 1. PhonePe -->
        <a href="/public/qr.php?order=<?php echo urlencode($orderId); ?>&app=phonepe" class="app-card">
          <div class="app-info">
            <div class="app-icon phonepe">
              <span>पे</span>
            </div>
            <div class="app-details">
              <div class="app-name">PhonePe</div>
              <div class="app-tag">Recommended · Fastest</div>
            </div>
          </div>
          <div class="app-arrow">›</div>
        </a>

        <!-- 2. Paytm -->
        <a href="/public/qr.php?order=<?php echo urlencode($orderId); ?>&app=paytm" class="app-card">
          <div class="app-info">
            <div class="app-icon paytm">
              <span style="color:#002e6e;font-size:11px;font-weight:900;">pay<span style="color:#00b9f5">tm</span></span>
            </div>
            <div class="app-details">
              <div class="app-name">Paytm</div>
              <div class="app-tag">One tap pay</div>
            </div>
          </div>
          <div class="app-arrow">›</div>
        </a>

        <!-- 3. QR Code -->
        <a href="/public/qr.php?order=<?php echo urlencode($orderId); ?>" class="app-card">
          <div class="app-info">
            <div class="app-icon qr">
              <span>☲</span>
            </div>
            <div class="app-details">
              <div class="app-name">QR Code</div>
              <div class="app-tag">Scan in any UPI app</div>
            </div>
          </div>
          <div class="app-arrow">›</div>
        </a>
      </div>

      <!-- Green Action Button (Screenshot 1) -->
      <a href="/public/proof.php?order=<?php echo urlencode($orderId); ?>" class="btn-submit-green">
        <div class="btn-circle-icon">↑</div>
        <div class="btn-text-block">
          <div class="btn-title">Submit Screenshot</div>
          <div class="btn-subtitle">After Payment</div>
        </div>
        <div class="btn-circle-icon">→</div>
      </a>
    </div>
  </div>
</body>
</html>
