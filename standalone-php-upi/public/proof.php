<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';
$paymentConfig = require dirname(__DIR__) . '/config/payment.php';

require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Services/PaymentProviderAdapter.php';
require_once dirname(__DIR__) . '/app/Services/PaymentService.php';

use App\Models\Order;
use App\Services\PaymentService;

$orderId = $_GET['order'] ?? '';
$order = Order::findByOrderId($orderId);
if (!$order) {
    header('Location: /public/checkout.php');
    exit;
}

$errorMessage = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['screenshot']) || empty($_FILES['screenshot']['name'])) {
        $errorMessage = 'कृपया पेमेंट स्क्रीनशॉट चुनें (Screenshot is required)';
    } else {
        try {
            $service = new PaymentService($paymentConfig);
            $utr = trim($_POST['utr'] ?? '');
            $service->processScreenshotProof($orderId, $_FILES['screenshot'], $utr);
            header("Location: /public/status.php?order=" . urlencode($orderId));
            exit;
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Screenshot Upload करें</title>
  <link rel="stylesheet" href="/public/assets/style.css">
</head>
<body>
  <div class="checkout-container">
    <div style="padding: 16px 20px 0;">
      <a href="/public/qr.php?order=<?php echo urlencode($orderId); ?>" style="color:#94a3b8; text-decoration:none; font-size:12px; font-weight:700;">
        ← Back to QR
      </a>
    </div>

    <div class="checkout-header" style="text-align: left; padding-top: 10px;">
      <div class="section-label orange">PAYMENT CONFIRMATION</div>
      <h1 style="font-size: 24px;">Screenshot Upload करें</h1>
      <p>Payment ke baad Screenshot Upload करो.</p>
    </div>

    <div class="checkout-body">
      <?php if ($errorMessage): ?>
        <div style="background-color: rgba(225,29,72,0.2); border: 1px solid #e11d48; color: #fecdd3; padding: 10px 14px; border-radius: 12px; font-size: 12px; margin-bottom: 12px;">
          ⚠ <?php echo htmlspecialchars($errorMessage); ?>
        </div>
      <?php endif; ?>

      <form action="/public/proof.php?order=<?php echo urlencode($orderId); ?>" method="POST" enctype="multipart/form-data">
        <div class="upload-form-group">
          <div class="upload-label">
            <span>Screenshot Upload करें</span>
            <span style="color: var(--text-secondary); font-size: 11px;">(required)</span>
          </div>

          <label for="screenshot-file" class="upload-input-box">
            <div style="display:flex; align-items:center; overflow:hidden;">
              <span class="file-select-btn">Choose File</span>
              <span id="chosen-filename" style="font-size: 12px; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                No file chosen
              </span>
            </div>
            <img id="preview-thumb" src="" alt="preview" style="display:none; width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid #475569;">
          </label>

          <input type="file" id="screenshot-file" name="screenshot" accept="image/jpeg,image/png,image/webp" style="display: none;" required>

          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">
            JPG, PNG or WebP, up to 5 MB.
          </div>
        </div>

        <!-- Optional UTR Input -->
        <div class="upload-form-group" style="margin-top: 14px;">
          <label style="font-size: 12px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 4px;">
            UTR / Transaction ID (Optional)
          </label>
          <input type="text" name="utr" placeholder="12-digit UTR number if known" style="width: 100%; padding: 10px 14px; background: #080d1a; border: 1px solid var(--border-subtle); border-radius: 12px; color: white; font-size: 12px;">
        </div>

        <button type="submit" class="btn-orange-action">
          Screenshot Upload करें →
        </button>
      </form>

      <div class="warning-disclaimer">
        Access remains locked until the payment is verified. Reused or false payment proofs will be rejected.
      </div>
    </div>
  </div>

  <script src="/public/assets/app.js"></script>
</body>
</html>
