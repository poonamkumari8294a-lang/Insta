<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';

require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Models/Payment.php';

use App\Models\Order;

$orderId = $_GET['order'] ?? '';
$order = Order::findByOrderId($orderId);

if (!$order) {
    header('Location: /public/checkout.php');
    exit;
}

if ($order['status'] === 'paid') {
    header("Location: /public/success.php?order=" . urlencode($orderId));
    exit;
}

$amountFormatted = '₹' . number_format((float)$order['amount'], 0);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual Review Required - <?php echo htmlspecialchars($order['order_id']); ?></title>
  <link rel="stylesheet" href="/public/assets/style.css">
</head>
<body>
  <div class="checkout-container">
    <div class="checkout-header" style="padding-bottom: 4px;">
      <!-- Circle avatar with V -->
      <div class="review-avatar-wrap">
        <div class="review-avatar">V</div>
      </div>

      <div class="section-label orange">UPI PAYMENT CHECK</div>
      <h1 style="font-size: 22px;">Manual review required</h1>
      <p style="font-size: 11px; max-width: 320px; margin: 6px auto 0;">
        Queued for manual review: could not clearly read successful payment status, a clear payment amount, receipt date and time.
      </p>
    </div>

    <div class="checkout-body">
      <!-- Verification window -->
      <div class="progress-card">
        <div class="progress-header">
          <span style="color: var(--text-secondary);">Verification window</span>
          <span style="color: var(--orange-accent);">Manual Review</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill"></div>
        </div>
        <div style="font-size: 11px; color: var(--text-secondary);">
          The latest verification state is shown below.
        </div>
      </div>

      <!-- Order Details -->
      <div class="order-detail-card">
        <div class="order-row">
          <span class="label">Order</span>
          <span class="value" style="display: flex; align-items: center; gap: 6px;">
            <code style="font-family: monospace; font-size: 13px; color: white;"><?php echo htmlspecialchars($order['order_id']); ?></code>
            <button id="btn-copy-order" onclick="window.upiCheckoutApp.copyOrderId()" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; font-weight: 700;">
              Copy
            </button>
          </span>
        </div>
        <div class="order-row">
          <span class="label">Amount</span>
          <span class="value"><?php echo $amountFormatted; ?></span>
        </div>
        <div class="order-row">
          <span class="label">Status</span>
          <span class="value" style="color: var(--orange-accent);">Manual Review</span>
        </div>
      </div>

      <!-- Queue Card with Rotating Icon -->
      <div class="queue-highlight-card">
        <div class="queue-icon">
          <span style="display:inline-block;animation:spin 3s linear infinite;">↻</span>
        </div>
        <div class="queue-title">
          Your payment proof is in the manual queue.
        </div>
        <div class="queue-desc">
          Queued for manual review: could not clearly read successful payment status, a clear payment amount, receipt date and time.
        </div>
        <div class="queue-subtext">
          Keep this page or return from the same browser. If approved, the VIP download will unlock here automatically.
        </div>
      </div>

      <!-- Footer Disclaimer -->
      <div class="warning-disclaimer" style="margin-top: 16px;">
        You can safely close this page. Duplicate confirmations are handled automatically.
      </div>
    </div>
  </div>

  <script src="/public/assets/app.js"></script>
</body>
</html>
