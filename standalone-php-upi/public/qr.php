<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';
$paymentConfig = require dirname(__DIR__) . '/config/payment.php';

require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Services/UpiService.php';
require_once dirname(__DIR__) . '/app/Services/QrService.php';

use App\Models\Order;
use App\Services\UpiService;
use App\Services\QrService;

$orderId = $_GET['order'] ?? '';
$order = Order::findByOrderId($orderId);
if (!$order) {
    header('Location: /public/checkout.php');
    exit;
}

$amount = (float)$order['amount'];
$amountFormatted = '₹' . number_format($amount, 0);

$urls = UpiService::buildPayload(
    $paymentConfig['upi_vpa'],
    $paymentConfig['merchant_name'],
    $amount,
    $order['order_id'],
    "Order {$order['order_id']}"
);

$qrUrl = QrService::getQrImageUrl($urls['generic'], 260);

// If app deep-link requested via query param
$requestedApp = $_GET['app'] ?? null;
$autoLaunchUrl = null;
if ($requestedApp === 'phonepe') $autoLaunchUrl = $urls['phonepe'];
if ($requestedApp === 'paytm') $autoLaunchUrl = $urls['paytm'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan & Pay <?php echo $amountFormatted; ?></title>
  <link rel="stylesheet" href="/public/assets/style.css">
  <?php if ($autoLaunchUrl): ?>
    <script>
      window.location.href = "<?php echo addslashes($autoLaunchUrl); ?>";
    </script>
  <?php endif; ?>
</head>
<body>
  <div class="checkout-container">
    <div style="padding: 16px 20px 0;">
      <a href="/public/checkout.php?order=<?php echo urlencode($orderId); ?>" style="color:#94a3b8; text-decoration:none; font-size:12px; font-weight:700;">
        ← Back to UPI Apps
      </a>
    </div>

    <div class="checkout-body" style="padding-top: 10px;">
      <!-- White QR Box (Exact Screenshot 3 replica) -->
      <div class="qr-white-box">
        <div class="qr-title">Scan & Pay</div>
        <div class="qr-amount">Amount: <?php echo $amountFormatted; ?></div>
        <div class="qr-timer">Expires in: <span id="countdown-timer">29:29</span></div>

        <div class="qr-image-container">
          <img src="<?php echo htmlspecialchars($qrUrl); ?>" alt="UPI QR Code" class="qr-image">
        </div>

        <a href="<?php echo htmlspecialchars($qrUrl); ?>" download="UPI-QR-<?php echo htmlspecialchars($orderId); ?>.png" class="btn-save-qr">
          <span>⬇ Save QR</span>
        </a>

        <div class="qr-apps-subtext">
          Scan & pay with <strong style="color:#2563eb;">G Pay</strong> | <strong style="color:#5f259f;">PhonePe</strong> | <strong style="color:#00b9f5;">Paytm</strong> or any UPI app
        </div>

        <div class="qr-waiting-text">
          <span style="display:inline-block;animation:spin 1s linear infinite;">↻</span>
          Waiting for payment... submit your proof to confirm
        </div>
      </div>

      <!-- Green Action Button (Screenshot 3) -->
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

  <script src="/public/assets/app.js"></script>
</body>
</html>
