<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';

require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Models/Payment.php';

use App\Models\Order;
use App\Models\Payment;

$orderId = $_GET['order'] ?? '';
$order = Order::findByOrderId($orderId);

if (!$order || $order['status'] !== 'paid') {
    header("Location: /public/status.php?order=" . urlencode($orderId));
    exit;
}

$payment = Payment::findByOrderId($orderId);
$amountFormatted = '₹' . number_format((float)$order['amount'], 0);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - <?php echo htmlspecialchars($order['order_id']); ?></title>
  <link rel="stylesheet" href="/public/assets/style.css">
</head>
<body>
  <div class="checkout-container">
    <div class="checkout-body" style="padding: 36px 24px; text-align: center;">
      <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; color: #10b981; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">
        ✓
      </div>

      <div class="section-label" style="color: #10b981;">✓ PAYMENT VERIFIED</div>
      <h1 style="font-size: 24px; margin-bottom: 6px;">Payment Successful</h1>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">
        Your payment has been successfully confirmed. Content is unlocked!
      </p>

      <div class="order-detail-card" style="text-align: left; margin-bottom: 24px;">
        <div class="order-row">
          <span class="label">Order ID</span>
          <span class="value"><code><?php echo htmlspecialchars($order['order_id']); ?></code></span>
        </div>
        <div class="order-row">
          <span class="label">Amount</span>
          <span class="value" style="color: #10b981;"><?php echo $amountFormatted; ?></span>
        </div>
        <div class="order-row">
          <span class="label">Status</span>
          <span class="value" style="color: #10b981;">PAID & UNLOCKED</span>
        </div>
      </div>

      <a href="/" class="btn-submit-green" style="justify-content: center; font-size: 15px;">
        <span>View VIP Content Now →</span>
      </a>
    </div>
  </div>
</body>
</html>
