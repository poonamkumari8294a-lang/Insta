<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';

require_once dirname(__DIR__) . '/app/Middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/app/Models/Order.php';
require_once dirname(__DIR__) . '/app/Models/PaymentProof.php';

use App\Middleware\AuthMiddleware;
use App\Models\Order;
use App\Models\PaymentProof;

$admin = AuthMiddleware::requireAdmin();
$orderId = $_GET['order'] ?? '';

$order = Order::findByOrderId($orderId);
if (!$order) {
    die("Order not found");
}

$proof = PaymentProof::findByOrderId($orderId);
$message = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'approve') {
        require_once dirname(__DIR__) . '/api/admin/approve.php';
        exit;
    } elseif ($action === 'reject') {
        require_once dirname(__DIR__) . '/api/admin/reject.php';
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inspect Proof - <?php echo htmlspecialchars($orderId); ?></title>
  <link rel="stylesheet" href="/public/assets/style.css">
  <style>
    body { display: block; padding: 20px; }
    .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1000px; margin: 0 auto; }
    @media (max-width: 768px) { .review-grid { grid-template-columns: 1fr; } }
    .card { background: #0b101b; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; }
    .img-preview-box { width: 100%; min-height: 380px; background: #050811; border: 1px solid #1e293b; border-radius: 14px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
    .img-preview-box img { max-width: 100%; max-height: 480px; object-fit: contain; transition: transform 0.2s ease; }
    .toolbar-btn { background: #1e293b; color: white; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div style="max-width: 1000px; margin: 0 auto 16px;">
    <a href="/admin/orders.php" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 700;">
      ← Back to Orders
    </a>
  </div>

  <div class="review-grid">
    <!-- Left: Screenshot & Controls -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 800;">Payment Screenshot</h2>
        <div style="display: flex; gap: 6px;">
          <button class="toolbar-btn" onclick="rotateImage()">↻ Rotate</button>
          <button class="toolbar-btn" onclick="zoomIn()">+ Zoom</button>
          <button class="toolbar-btn" onclick="zoomOut()">- Zoom</button>
        </div>
      </div>

      <div class="img-preview-box">
        <?php if ($proof && !empty($proof['file_path'])): ?>
          <img id="review-img" src="<?php echo htmlspecialchars($proof['file_path']); ?>" alt="Payment Proof">
        <?php else: ?>
          <div style="color: #64748b; font-size: 13px;">No screenshot file submitted for this order</div>
        <?php endif; ?>
      </div>
    </div>

    <!-- Right: Order Details & Decision Form -->
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="section-label orange">MANUAL VERIFICATION</div>
        <h2 style="font-size: 20px; font-weight: 900; margin-bottom: 12px;">Order Review</h2>

        <div class="order-detail-card" style="margin-top: 0; margin-bottom: 16px;">
          <div class="order-row">
            <span class="label">Order ID:</span>
            <span class="value"><code><?php echo htmlspecialchars($order['order_id']); ?></code></span>
          </div>
          <div class="order-row">
            <span class="label">Amount:</span>
            <span class="value" style="font-size: 16px; color: #10b981;">₹<?php echo number_format((float)$order['amount'], 2); ?></span>
          </div>
          <div class="order-row">
            <span class="label">Status:</span>
            <span class="value" style="color: #f97316;"><?php echo strtoupper($order['status']); ?></span>
          </div>
          <div class="order-row">
            <span class="label">Customer Name:</span>
            <span class="value"><?php echo htmlspecialchars($order['customer_name'] ?: 'Not provided'); ?></span>
          </div>
          <div class="order-row">
            <span class="label">Phone:</span>
            <span class="value"><?php echo htmlspecialchars($order['customer_phone'] ?: 'Not provided'); ?></span>
          </div>
          <div class="order-row">
            <span class="label">UTR Claimed:</span>
            <span class="value"><code><?php echo htmlspecialchars($proof['utr_reference'] ?? 'None'); ?></code></span>
          </div>
        </div>

        <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 12px; font-size: 11px; color: #fdba74; line-height: 1.5;">
          <strong>Review Checklist:</strong> Verify that the payee UPI ID matches, the exact amount ₹<?php echo number_format((float)$order['amount'], 0); ?> was transferred, and the timestamp matches today's session.
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
        <button onclick="approveOrder('<?php echo htmlspecialchars($order['order_id']); ?>')" class="btn-submit-green" style="margin-top: 0; justify-content: center; font-size: 15px;">
          <span>✓ Approve & Unlock Content Now</span>
        </button>

        <button onclick="rejectOrder('<?php echo htmlspecialchars($order['order_id']); ?>')" style="width: 100%; padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; border-radius: 18px; font-weight: 800; cursor: pointer;">
          ✗ Reject Fake or Duplicate Proof
        </button>
      </div>
    </div>
  </div>

  <script>
    let rotation = 0;
    let zoom = 1;
    function rotateImage() {
      rotation = (rotation + 90) % 360;
      applyTransform();
    }
    function zoomIn() {
      zoom = Math.min(zoom + 0.25, 3);
      applyTransform();
    }
    function zoomOut() {
      zoom = Math.max(zoom - 0.25, 0.5);
      applyTransform();
    }
    function applyTransform() {
      const img = document.getElementById('review-img');
      if (img) img.style.transform = `rotate(${rotation}deg) scale(${zoom})`;
    }

    async function approveOrder(orderId) {
      if (!confirm('Are you sure you want to approve this order? The customer will receive immediate VIP content unlock.')) return;
      const res = await fetch('/api/admin/approve.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, transaction_ref: 'MANUAL_VERIFIED_' + Date.now() })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order approved successfully!');
        window.location.href = '/admin/orders.php';
      } else {
        alert('Approval failed: ' + (data.error || 'Unknown error'));
      }
    }

    async function rejectOrder(orderId) {
      const reason = prompt('Please enter rejection reason:', 'Could not clearly verify payment amount and timestamp');
      if (!reason) return;
      const res = await fetch('/api/admin/reject.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, reason: reason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order rejected.');
        window.location.href = '/admin/orders.php';
      } else {
        alert('Rejection failed: ' + (data.error || 'Unknown error'));
      }
    }
  </script>
</body>
</html>
